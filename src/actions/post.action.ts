"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { CreatePostSchema } from "@/lib/validations/post.validation";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { postRateLimit, checkRateLimit } from "@/lib/rate-limit";
import { commentRateLimit  } from "@/lib/rate-limit";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "./user.action";


/**
 * Créer un nouveau post avec rate limiting
 */
export async function createPost(content: string, image?: string) {
  try {
    // Étape 1: Récupérer l'utilisateur
    

    const userId = await getDbUserId();
    if (!userId) {
      logger.warn({
        context: "createPost",
        action: "Unauthorized attempt - no user ID",
      });
      return { success: false, error: "Non autorisé" };
    }

    // Étape 2: VÉRIFIER LE RATE LIMIT ⬅️ NOUVEAU
    const rateLimitResult = await checkRateLimit(
      postRateLimit,
      userId, //identifier unique = ID utilisateur
      "createPost"
    )

    if (!rateLimitResult.success) {
      logger.warn({
        context: "createPost",
        action: "Rate limit exceeded",
        details: { userId, resetAfter: rateLimitResult.resetAfter },
      });
      return {
        success: false,
        error: `Trop de posts trop rapidement. Réessayez dans ${Math.ceil(rateLimitResult.resetAfter / 1000)}s`,
      };
    }

    // Étape 3: Validation Zod
    const validatedData = CreatePostSchema.parse({ content, image });

    // Étape 4: Créer le post en base de données
    const post = await prisma.post.create({
      data: {
        content: validatedData.content,
        image: validatedData.image,
        authorId: userId,
      },
    });

    logger.info({
      context: "createPost",
      action: "Post created successfully",
      details: { postId: post.id, authorId: userId, contentLength: content.length },
    });

    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    logger.error({
      context: "createPost",
      action: "Failed to create post",
      error,
    });

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Données invalides",
      };
    }

    return { success: false, error: "Erreur lors de la création du post" };
  }
}

/**
 * Récupérer tous les posts en excluant les utilisateurs bloqués
 */
export async function getPosts() {
  try {
    // Récupérer l'ID de l'utilisateur actuel pour filtrer les bloqués
    const currentUserId = await getDbUserId();

    // Récupérer les IDs des utilisateurs bloqués par l'utilisateur actuel
    let blockedUserIds: string[] = [];
    if (currentUserId) {
      const blocks = await prisma.block.findMany({
        where: { blockerId: currentUserId },
        select: { blockedId: true },
      });
      blockedUserIds = blocks.map(block => block.blockedId);
    }

    const posts = await prisma.post.findMany({
      where: {
        // Exclure les posts des utilisateurs bloqués
        authorId: {
          notIn: blockedUserIds.length > 0 ? blockedUserIds : undefined,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            image: true,
            username: true,
          },
        },
        comments: {
          // Filtrer également les commentaires des utilisateurs bloqués
          where: {
            authorId: {
              notIn: blockedUserIds.length > 0 ? blockedUserIds : undefined,
            },
          },
          include: {
            author: {
              select: {
                id: true,
                clerkId: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    logger.debug({
      context: "getPosts",
      action: "Posts fetched successfully",
      details: { count: posts.length, blockedUsersFiltered: blockedUserIds.length },
    });

    return posts;
  } catch (error) {
    logger.error({
      context: "getPosts",
      action: "Failed to fetch posts",
      error,
    });

    throw new Error("Impossible de charger les posts");
  }
}

/**
 * Liker ou retirer un like d'un post
 */
export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      logger.warn({
        context: "toggleLike",
        action: "Unauthorized attempt",
        details: { postId },
      });
      return { success: false, error: "Non autorisé" };
    }

    // Vérifier si le like existe déjà
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    // Récupérer le post et son auteur
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      logger.warn({
        context: "toggleLike",
        action: "Post not found",
        details: { postId },
      });
      throw new Error("Post introuvable");
    }

    if (existingLike) {
      // Retirer le like
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      logger.info({
        context: "toggleLike",
        action: "Like removed",
        details: { postId, userId },
      });
    } else {
      // Ajouter un like et créer une notification
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId,
          },
        }),
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId,
                  creatorId: userId,
                  postId,
                },
              }),
            ]
          : []),
      ]);

      logger.info({
        context: "toggleLike",
        action: "Like added",
        details: { postId, userId, authorId: post.authorId },
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error({
      context: "toggleLike",
      action: "Failed to toggle like",
      error,
      details: { postId },
    });

    return { success: false, error: "Impossible de liker le post" };
  }
}

/**
 * Créer un commentaire avec rate limiting
 */
export async function createComment(postId: string, content: string) {
  try {
    // Validation Zod inline pour les commentaires
    const CreateCommentSchema = z.object({
      content: z
        .string()
        .min(1, "Le commentaire ne peut pas être vide")
        .max(300, "Le commentaire ne peut pas dépasser 300 caractères")
        .trim(),
      postId: z.string().cuid("ID de post invalide"),
    });

    const validatedData = CreateCommentSchema.parse({ content, postId });

// Étape 2: Récupérer l'utilisateur
    const userId = await getDbUserId();
    if (!userId) {
      logger.warn({
        context: "createComment",
        action: "Unauthorized attempt",
        details: { postId },
      });
      return { success: false, error: "Non autorisé" };
    }

     // Étape 3: VÉRIFIER LE RATE LIMIT ⬅️ NOUVEAU
    const rateLimitResult = await checkRateLimit(
      commentRateLimit,
      userId,
      "createComment"
    );

    if (!rateLimitResult.success) {
      logger.warn({
        context: "createComment",
        action: "Rate limit exceeded",
        details: { userId, postId },
      });
      return {
        success: false,
        error: `Trop de commentaires trop rapidement. Réessayez dans ${Math.ceil(rateLimitResult.resetAfter / 1000)}s`,
      };
    }

    // Étape 4: Vérifier que le post existe
    const post = await prisma.post.findUnique({
      where: { id: validatedData.postId },
      select: { authorId: true },
    });

    if (!post) {
      logger.warn({
        context: "createComment",
        action: "Post not found",
        details: { postId: validatedData.postId },
      });
      throw new Error("Post introuvable");
    }

    //Étape 5:  Créer le commentaire et la notification en transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          content: validatedData.content,
          authorId: userId,
          postId: validatedData.postId,
        },
      });

      // Créer une notification si ce n'est pas l'auteur du post
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId: validatedData.postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    logger.info({
      context: "createComment",
      action: "Comment created successfully",
      details: {
        commentId: comment.id,
        postId: validatedData.postId,
        authorId: userId,
        contentLength: content.length,
      },
    });

    revalidatePath("/");
    return { success: true, comment };
  } catch (error) {
    logger.error({
      context: "createComment",
      action: "Failed to create comment",
      error,
      details: { postId },
    });

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Données invalides",
      };
    }

    return { success: false, error: "Erreur lors de la création du commentaire" };
  }
}

/**
 * Supprimer un post
 */
export async function deletePost(postId: string) {
  try {
    await prisma.post.delete({
      where: { id: postId },
    });

    return { success: true };
  } catch (error) {
    logger.error({
      context: "deletePost",
      action: "Failed to delete post",
      error,
      details: { postId },
    });
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

/**
 * Récupérer les posts d'un utilisateur
 */
export async function getUserPosts(userId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    logger.debug({
      context: "getUserPosts",
      action: "User posts fetched",
      details: { userId, count: posts.length },
    });

    return posts;
  } catch (error) {
    logger.error({
      context: "getUserPosts",
      action: "Failed to fetch user posts",
      error,
      details: { userId },
    });

    return [];
  }
}

/**
 * Récupérer un post par son ID
 */
export async function getPostById(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      logger.warn({
        context: "getPostById",
        action: "Post not found",
        details: { postId },
      });
      return null;
    }

    return post;
  } catch (error) {
    logger.error({
      context: "getPostById",
      action: "Failed to fetch post",
      error,
      details: { postId },
    });

    return null;
  }
}


/**
 * Éditer un commentaire existant
 * 
 * ✅ ÉTAPES:
 * 1. Vérifier authentification
 * 2. Vérifier que le commentaire existe
 * 3. Vérifier l'ownership
 * 4. Valider avec Zod
 * 5. Mettre à jour
 */

export async function editComment(
  commentId: string,
  content: string
) {
  try {
    // ✅ ÉTAPE 1: Récupérer l'utilisateur
    const userId = await getDbUserId();
    if (!userId) {
      logger.warn({
        context: "editComment",
        action: "Unauthorized attempt",
        details: { commentId },
      });
      return { success: false, error: "Non autorisé" };
    }

// ✅ ÉTAPE 2: Vérifier que le commentaire existe
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    });

    if (!comment) {
      logger.warn({
        context: "editComment",
        action: "Comment not found",
        details: { commentId },
      });
      return { success: false, error: "Commentaire introuvable" };
    }

    // ✅ ÉTAPE 3: Vérifier l'ownership
    if (comment.authorId !== userId) {
      logger.warn({
        context: "editComment",
        action: "User is not comment author",
        details: { commentId, userId, authorId: comment.authorId },
      });
      return {
        success: false,
        error: "Vous ne pouvez éditer que vos propres commentaires",
      };
    }

     // ✅ ÉTAPE 4: Valider avec Zod
    const validatedContent = z
      .string()
      .min(1, "Le commentaire ne peut pas être vide")
      .max(500, "Le commentaire ne peut pas dépasser 500 caractères")
      .trim()
      .parse(content);

       // ✅ ÉTAPE 5: Mettre à jour
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: validatedContent,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            image: true,
            name: true,
          },
        },
      },
    });

    logger.info({
      context: "editComment",
      action: "Comment edited successfully",
      details: { commentId, postId: comment.postId },
    });

    revalidatePath(`/posts/${comment.postId}`);
    return { success: true, comment: updatedComment };
  } catch (error) {
    logger.error({
      context: "editComment",
      action: "Failed to edit comment",
      error,
      details: { commentId },
    });

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Données invalides",
      };
    }

    return { success: false, error: "Erreur lors de l'édition du commentaire" };
  }
}

/**
 * Supprimer un commentaire
 * 
 * ✅ ÉTAPES:
 * 1. Vérifier authentification
 * 2. Vérifier que le commentaire existe
 * 3. Vérifier l'ownership
 * 4. Supprimer
 */
export async function deleteComment(commentId: string) {
  try {
    // ✅ ÉTAPE 1: Récupérer l'utilisateur
    const userId = await getDbUserId();
    if (!userId) {
      logger.warn({
        context: "deleteComment",
        action: "Unauthorized attempt",
        details: { commentId },
      });
      return { success: false, error: "Non autorisé" };
    }

      // ✅ ÉTAPE 2: Vérifier que le commentaire existe
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    });

    if (!comment) {
      logger.warn({
        context: "deleteComment",
        action: "Comment not found",
        details: { commentId },
      });
      return { success: false, error: "Commentaire introuvable" };
    }

    // ✅ ÉTAPE 3: Vérifier l'ownership
    if (comment.authorId !== userId) {
      logger.warn({
        context: "deleteComment",
        action: "User is not comment author",
        details: { commentId, userId, authorId: comment.authorId },
      });
      return {
        success: false,
        error: "Vous ne pouvez supprimer que vos propres commentaires",
      };
    }

    // ✅ ÉTAPE 4: Supprimer
    await prisma.comment.delete({
      where: { id: commentId },
    });

    logger.info({
      context: "deleteComment",
      action: "Comment deleted successfully",
      details: { commentId, postId: comment.postId },
    });

    revalidatePath(`/posts/${comment.postId}`);
    return { success: true };
  } catch (error) {
    logger.error({
      context: "deleteComment",
      action: "Failed to delete comment",
      error,
      details: { commentId },
    });

     return { success: false, error: "Erreur lors de la suppression du commentaire" };
  }
}

/**
 * Mettre à jour un post
 */
export async function updatePost(postId: string, content: string) {
  try {
    // ✅ Validation
    if (!content.trim()) {
      return { success: false, error: "Le contenu du post ne peut pas être vide" };
    }

    if (content.length > 5000) {
      return { success: false, error: "Le contenu ne peut pas dépasser 5000 caractères" };
    }

    // ✅ Récupérer et mettre à jour
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content: content.trim(),
        updatedAt: new Date(),
      },
      include: {
        author: true,
        likes: true,
        comments: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    logger.info({
      context: "updatePost",
      action: "Post updated successfully",
      details: { postId },
    });
    
    return { success: true, data: updatedPost };
  } catch (error) {
    logger.error({
      context: "updatePost",
      action: "Failed to update post",
      error,
      details: { postId },
    });

    return { success: false, error: "Erreur lors de la mise à jour du post" };
  }
}

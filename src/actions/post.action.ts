"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { CreatePostSchema } from "@/lib/validations/post.validation";
import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Créer un nouveau post
 */
export async function createPost(content: string, image?: string) {
  try {
    // Validation Zod
    const validatedData = CreatePostSchema.parse({ content, image });

    const userId = await getDbUserId();
    if (!userId) {
      logger.warn({
        context: "createPost",
        action: "Unauthorized attempt - no user ID",
      });
      return { success: false, error: "Non autorisé" };
    }

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
 * Récupérer tous les posts
 */
export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
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
      details: { count: posts.length },
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
 * Créer un commentaire sur un post
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

    const userId = await getDbUserId();
    if (!userId) {
      logger.warn({
        context: "createComment",
        action: "Unauthorized attempt",
        details: { postId },
      });
      return { success: false, error: "Non autorisé" };
    }

    // Vérifier que le post existe
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

    // Créer le commentaire et la notification en transaction
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
    const userId = await getDbUserId();
    if (!userId) {
      logger.warn({
        context: "deletePost",
        action: "Unauthorized attempt",
        details: { postId },
      });
      return { success: false, error: "Non autorisé" };
    }

    // Récupérer le post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      logger.warn({
        context: "deletePost",
        action: "Post not found",
        details: { postId },
      });
      throw new Error("Post introuvable");
    }

    // Vérifier que l'utilisateur est bien l'auteur
    if (post.authorId !== userId) {
      logger.warn({
        context: "deletePost",
        action: "Unauthorized - not the author",
        details: { postId, userId, authorId: post.authorId },
      });
      return { success: false, error: "Non autorisé - vous n'êtes pas l'auteur" };
    }

    // Supprimer le post
    await prisma.post.delete({
      where: { id: postId },
    });

    logger.info({
      context: "deletePost",
      action: "Post deleted successfully",
      details: { postId, userId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error({
      context: "deletePost",
      action: "Failed to delete post",
      error,
      details: { postId },
    });

    return { success: false, error: "Erreur lors de la suppression du post" };
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
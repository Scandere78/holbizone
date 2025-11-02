"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

/**
 * Toggle bookmark d'un post
 */
export async function toggleBookmark(postId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    // Trouver l'utilisateur en base de données
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    // Vérifier si le post existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "Post non trouvé" };
    }

    // Vérifier si déjà bookmarké
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: dbUser.id,
          postId: postId,
        },
      },
    });

    if (existingBookmark) {
      // Supprimer le bookmark
      await prisma.bookmark.delete({
        where: {
          userId_postId: {
            userId: dbUser.id,
            postId: postId,
          },
        },
      });

      logger.debug({
        context: "toggleBookmark",
        action: "Bookmark removed",
        details: { postId, userId: dbUser.id },
      });

      return { success: true, bookmarked: false };
    } else {
      // Ajouter le bookmark
      await prisma.bookmark.create({
        data: {
          userId: dbUser.id,
          postId: postId,
        },
      });

      logger.debug({
        context: "toggleBookmark",
        action: "Bookmark added",
        details: { postId, userId: dbUser.id },
      });

      return { success: true, bookmarked: true };
    }
  } catch (error) {
    logger.error({
      context: "toggleBookmark",
      action: "Failed",
      error,
    });

    return { success: false, error: "Erreur lors du bookmark" };
  }
}

/**
 * Récupérer les bookmarks de l'utilisateur
 */
export async function getUserBookmarks() {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, bookmarks: [] };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return { success: false, bookmarks: [] };
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: dbUser.id },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: { likes: true, comments: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, bookmarks };
  } catch (error) {
    logger.error({
      context: "getUserBookmarks",
      action: "Failed",
      error,
    });

    return { success: false, bookmarks: [] };
  }
}

/**
 * Vérifier si un post est bookmarké
 */
export async function isPostBookmarked(postId: string) {
  try {
    const user = await currentUser();
    if (!user) return false;

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) return false;

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: dbUser.id,
          postId: postId,
        },
      },
    });

    return !!bookmark;
  } catch {
    return false;
  }
}
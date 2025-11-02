"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

/**
 * Bloquer un utilisateur
 */
export async function blockUser(targetUserId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    if (dbUser.id === targetUserId) {
      return { success: false, error: "Vous ne pouvez pas vous bloquer" };
    }

    // Vérifier si déjà bloqué
    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: dbUser.id,
          blockedId: targetUserId,
        },
      },
    });

    if (existingBlock) {
      return { success: false, error: "Utilisateur déjà bloqué" };
    }

    await prisma.block.create({
      data: {
        blockerId: dbUser.id,
        blockedId: targetUserId,
      },
    });

    logger.debug({
      context: "blockUser",
      action: "User blocked",
      details: { blockerId: dbUser.id, blockedId: targetUserId },
    });

    return { success: true };
  } catch (error) {
    logger.error({
      context: "blockUser",
      action: "Failed",
      error,
    });

    return { success: false, error: "Erreur lors du blocage" };
  }
}

/**
 * Débloquer un utilisateur
 */
export async function unblockUser(targetUserId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    await prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId: dbUser.id,
          blockedId: targetUserId,
        },
      },
    });

    logger.debug({
      context: "unblockUser",
      action: "User unblocked",
      details: { blockerId: dbUser.id, blockedId: targetUserId },
    });

    return { success: true };
  } catch (error) {
    logger.error({
      context: "unblockUser",
      action: "Failed",
      error,
    });

    return { success: false, error: "Erreur lors du déblocage" };
  }
}

/**
 * Récupérer la liste des utilisateurs bloqués
 */
export async function getBlockedUsers() {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, blocked: [] };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        blocking: {
          include: {
            blocked: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
                bio: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return { success: true, blocked: dbUser?.blocking || [] };
  } catch (error) {
    logger.error({
      context: "getBlockedUsers",
      action: "Failed",
      error,
    });

    return { success: false, blocked: [] };
  }
}

/**
 * Vérifier si un utilisateur est bloqué
 */
export async function isUserBlocked(targetUserId: string) {
  try {
    const user = await currentUser();
    if (!user) return false;

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) return false;

    const block = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: dbUser.id,
          blockedId: targetUserId,
        },
      },
    });

    return !!block;
  } catch {
    return false;
  }
}
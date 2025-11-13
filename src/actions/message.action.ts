"use server";

import prisma from "@/lib/prisma";
import { getPusherServer } from "@/lib/pusher";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { SendMessageSchema, CreateConversationSchema } from "@/lib/validations/message.validation";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { messageRateLimit, checkRateLimit } from "@/lib/rate-limit";
export async function getOrCreatePrivateConversation(otherUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("Unauthorized");

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          {
            members: {
              some: { userId: userId },
            },
          },
          {
            members: {
              some: { userId: otherUserId },
            },
          },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (existingConversation) {
      return { success: true, conversation: existingConversation };
    }

    const newConversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        members: {
          create: [
            { userId: userId },
            { userId: otherUserId },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/messages");
    return { success: true, conversation: newConversation };
  } catch (error) {
    console.error("Error creating conversation:", error);
    return { success: false, error: "Failed to create conversation" };
  }
}

export async function createGroupConversation(data: {
  name: string;
  memberIds: string[];
  image?: string;
}) {
  try {
    const validatedData = CreateConversationSchema.parse({
      ...data,
      isGroup: true,
    });

    const userId = await getDbUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const conversation = await prisma.conversation.create({
      data: {
        name: validatedData.name,
        image: validatedData.image,
        isGroup: true,
        creatorId: userId,
        members: {
          create: [
            { userId: userId, role: "admin" },
            ...validatedData.memberIds.map((id) => ({ userId: id, role: "member" })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/messages");
    return { success: true, conversation };
  } catch (error) {
    console.error("Error creating group:", error);

    // CORRIGÉ: issues au lieu de errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Données invalides"
      };
    }

    return { success: false, error: "Failed to create group" };
  }
}

export async function getUserConversations() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

export async function getConversationMessages(conversationId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const isMember = await prisma.conversationMember.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
    });

    if (!isMember) return [];

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    await prisma.conversationMember.update({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export async function sendMessage(data: {
  conversationId: string;
  content: string;
  image?: string;
}) {
  try {
    const validatedData = SendMessageSchema.parse(data);

    // Étape 1: Récupérer l'utilisateur
    const userId = await getDbUserId();
    if (!userId) {
      logger.warn({
        context: "sendMessage",
        action: "Unauthorized access attempt",
        details: { conversationId: validatedData.conversationId },
      });
      return { success: false, error: "Unauthorized" };
    }

    // Étape 2: VÉRIFIER LE RATE LIMIT ⬅️ NOUVEAU
    const rateLimitResult = await checkRateLimit(
      messageRateLimit,
      userId,
      "sendMessage"
    );

    if (!rateLimitResult.success) {
      logger.warn({
        context: "sendMessage",
        action: "Rate limit exceeded",
        details: { userId, conversationId: validatedData.conversationId },
      });
      return {
        success: false,
        error: `Trop de messages trop rapidement. Réessayez dans ${Math.ceil(rateLimitResult.resetAfter / 1000)}s`,
      };
    }

    // Étape 3: Validation du contenu
    const sanitizedContent = validatedData.content.trim();
    if (!sanitizedContent || sanitizedContent.length > 5000) {
      return {
        success: false,
        error: "Le message doit contenir entre 1 et 5000 caractères",
      };
    }

    // Étape 4: Vérifier que la conversation existe et que l'utilisateur y a accès
    const isMember = await prisma.conversationMember.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId: validatedData.conversationId,
        },
      },
    });

    if (!isMember) {
      logger.warn({
        context: "sendMessage",
        action: "User not a member of conversation",
        details: { userId, conversationId: validatedData.conversationId },
      });
      return {
        success: false,
        error: "Vous n'êtes pas membre de cette conversation",
      };
    }

    // Étape 5: Créer le message
    const message = await prisma.message.create({
      data: {
        content: sanitizedContent,
        image: validatedData.image,
        senderId: userId,
        conversationId: validatedData.conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });



    // Étape 6: Mettre à jour lastReadAt pour l'expéditeur
    await prisma.conversationMember.update({
      where: {
        userId_conversationId: {
          userId,
          conversationId: validatedData.conversationId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    // Trigger Pusher notification (si disponible)
    const pusher = await getPusherServer();
    if (pusher) {
      await pusher.trigger(
        `conversation-${validatedData.conversationId}`,
        "new-message",
        message
      );
    }

    logger.info({
      context: "sendMessage",
      action: "Message sent successfully",
      details: {
        messageId: message.id,
        conversationId: validatedData.conversationId,
        senderId: userId,
      },
    });

    revalidatePath(`/messages/${validatedData.conversationId}`);
    revalidatePath("/messages");
    return { success: true, message };
  } catch (error) {
    logger.error({
      context: "sendMessage",
      action: "Failed to send message",
      error,
      details: { conversationId: data.conversationId },
    });

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Données invalides"
      };
    }

    return { success: false, error: "Erreur lors de l'envoi du message" };
  }
}

export async function getUnreadMessagesCount() {
  try {
    const userId = await getDbUserId();
    if (!userId) return 0;

    const memberships = await prisma.conversationMember.findMany({
      where: { userId },
      select: {
        lastReadAt: true,
        conversation: {
          select: {
            messages: {
              where: {
                senderId: {
                  not: userId,
                },
              },
              select: {
                createdAt: true,
              },
            },
          },
        },
      },
    });

    const count = memberships.reduce((total: number, membership) => {
      const unreadMessages = membership.conversation.messages.filter(
        (message: { createdAt: Date }) => message.createdAt > membership.lastReadAt
      );
      return total + unreadMessages.length;
    }, 0);

    return count;
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return 0;
  }
}

export async function getUnreadCountForConversation(conversationId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return 0;

    const membership = await prisma.conversationMember.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
      select: {
        lastReadAt: true,
      },
    });

    if (!membership) return 0;

    const unreadCount = await prisma.message.count({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        createdAt: {
          gt: membership.lastReadAt,
        },
      },
    });

    return unreadCount;
  } catch (error) {
    console.error("Error counting unread messages for conversation:", error);
    return 0;
  }
}

export async function getAvailableUsersForChat() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const following = await prisma.follows.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);

    const mutualFriends = await prisma.user.findMany({
      where: {
        id: {
          in: followingIds,
        },
        followers: {
          some: {
            followerId: userId,
          },
        },
        following: {
          some: {
            followingId: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
      },
    });

    const existingConversations = await prisma.conversation.findMany({
      where: {
        isGroup: false,
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          select: {
            userId: true,
          },
        },
      },
    });

    const existingUserIds = existingConversations.flatMap((conv) =>
      conv.members
        .filter((member) => member.userId !== userId)
        .map((member) => member.userId)
    );

    const availableUsers = mutualFriends.filter(
      (user) => !existingUserIds.includes(user.id)
    );

    return availableUsers;
  } catch (error) {
    console.error("Error fetching available users:", error);
    return [];
  }
}


/**
 * Récupérer le nom et détails de l'autre utilisateur dans une conversation privée
 */
export async function getConversationOtherUser(conversationId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return null;
    }

    // Récupérer la conversation et les membres
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      logger.warn({
        context: "getConversationOtherUser",
        action: "Conversation not found",
        details: { conversationId },
      });
      return null;
    }

    // Si c'est une conversation de groupe, retourner le nom du groupe
    if (conversation.isGroup) {
      logger.debug({
        context: "getConversationOtherUser",
        action: "Group conversation",
        details: { groupName: conversation.name },
      });
      return {
        id: conversation.id,
        name: conversation.name,
        username: null,
        image: conversation.image,
        isGroup: true,
      };
    }

    // Pour une conversation privée, trouver l'autre utilisateur
    const otherUser = conversation.members
      .map((member) => member.user)
      .find((user) => user.id !== userId);

    if (!otherUser) {
      logger.warn({
        context: "getConversationOtherUser",
        action: "Other user not found in conversation",
        details: { conversationId, userId },
      });
      return null;
    }

    logger.debug({
      context: "getConversationOtherUser",
      action: "Other user found",
      details: { otherUserId: otherUser.id, username: otherUser.username },
    });

    return {
      id: otherUser.id,
      name: otherUser.name,
      username: otherUser.username,
      image: otherUser.image,
      isGroup: false,
    };
  } catch (error) {
    logger.error({
      context: "getConversationOtherUser",
      action: "Failed to fetch conversation other user",
      error,
      details: { conversationId },
    });
    return null;
  }
}
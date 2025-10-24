"use server";

import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

/**
 * Créer ou récupérer une conversation privée entre 2 utilisateurs
 */
export async function getOrCreatePrivateConversation(otherUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("Unauthorized");

    // Chercher une conversation existante entre ces 2 utilisateurs
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

    // Créer une nouvelle conversation
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

/**
 * Créer un groupe
 */
export async function createGroupConversation(data: {
  name: string;
  memberIds: string[];
  image?: string;
}) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("Unauthorized");

    const conversation = await prisma.conversation.create({
      data: {
        name: data.name,
        image: data.image,
        isGroup: true,
        creatorId: userId,
        members: {
          create: [
            { userId: userId, role: "admin" },
            ...data.memberIds.map((id) => ({ userId: id, role: "member" })),
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
    return { success: false, error: "Failed to create group" };
  }
}

/**
 * Récupérer toutes les conversations de l'utilisateur
 */
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

/**
 * Récupérer les messages d'une conversation
 */
export async function getConversationMessages(conversationId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    // Vérifier que l'utilisateur est membre
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

    // Marquer comme lu
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

/**
 * Envoyer un message
 */
export async function sendMessage(data: {
  conversationId: string;
  content: string;
  image?: string;
}) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("Unauthorized");

    // Vérifier que l'utilisateur est membre
    const isMember = await prisma.conversationMember.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId: data.conversationId,
        },
      },
    });

    if (!isMember) throw new Error("Not a member of this conversation");

    const message = await prisma.message.create({
      data: {
        content: data.content,
        image: data.image,
        senderId: userId,
        conversationId: data.conversationId,
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

    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    // Émettre l'événement Pusher pour le temps réel
    await pusherServer.trigger(
      `conversation-${data.conversationId}`,
      "new-message",
      message
    );

    revalidatePath(`/messages/${data.conversationId}`);
    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

/**
 * Compter les messages non lus
 */
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

/**
 * Récupérer les amis mutuels (follow bidirectionnel) pour démarrer une conversation
 */
export async function getAvailableUsersForChat() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    // Récupérer les utilisateurs qu'on suit
    const following = await prisma.follows.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);

    // Récupérer ceux qui nous suivent en retour (amis mutuels)
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

    // Récupérer toutes les conversations privées existantes
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

    // Extraire les IDs des utilisateurs avec qui on a déjà une conversation
    const existingUserIds = existingConversations.flatMap((conv) =>
      conv.members
        .filter((member) => member.userId !== userId)
        .map((member) => member.userId)
    );

    // Filtrer pour ne garder que ceux avec qui on n'a pas encore de conversation
    const availableUsers = mutualFriends.filter(
      (user) => !existingUserIds.includes(user.id)
    );

    return availableUsers;
  } catch (error) {
    console.error("Error fetching available users:", error);
    return [];
  }
}
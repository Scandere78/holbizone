"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

/**
 * Récupère toutes les notifications de l'utilisateur
 */
export async function getNotifications() {
    try {
        const userId = await getDbUserId();
        if (!userId) return [];

        const notifications = await prisma.notification.findMany({
            where: {
                userId,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                post: {
                    select: {
                        id: true,
                        content: true,
                        image: true,
                    },
                },
                comment: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return notifications;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw new Error("Failed to fetch notifications");
    }
}

/**
 * Récupère le nombre de notifications non lues
 * 🆕 NOUVELLE FONCTION
 */
export async function getUnreadNotificationCount() {
    try {
        const userId = await getDbUserId();
        if (!userId) return 0;

        const count = await prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });

        return count;
    } catch (error) {
        console.error("Error getting unread notification count:", error);
        return 0;
    }
}

/**
 * Marque des notifications spécifiques comme lues
 */
export async function markNotificationsAsRead(notificationIds: string[]) {
    try {
        await prisma.notification.updateMany({
            where: {
                id: {
                    in: notificationIds,
                },
            },
            data: {
                read: true,
            },
        });
        
        revalidatePath("/notifications");
        return { success: true };
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return { success: false, error: "Failed to mark notifications as read" };
    }
}

/**
 * Marque TOUTES les notifications de l'utilisateur comme lues
 * 🆕 NOUVELLE FONCTION
 */
export async function markAllNotificationsAsRead() {
    try {
        const userId = await getDbUserId();
        if (!userId) return { success: false, error: "User not found" };

        await prisma.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: {
                read: true,
            },
        });

        revalidatePath("/notifications");
        return { success: true };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return { success: false, error: "Failed to mark notifications as read" };
    }
}

/**
 * Supprime une notification
 * 🆕 NOUVELLE FONCTION
 */
export async function deleteNotification(notificationId: string) {
    try {
        const userId = await getDbUserId();
        if (!userId) throw new Error("Unauthorized");

        // Vérifier que la notification appartient à l'utilisateur
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification || notification.userId !== userId) {
            throw new Error("Notification not found");
        }

        await prisma.notification.delete({
            where: { id: notificationId },
        });

        revalidatePath("/notifications");
        return { success: true };
    } catch (error) {
        console.error("Error deleting notification:", error);
        return { success: false, error: "Failed to delete notification" };
    }
}
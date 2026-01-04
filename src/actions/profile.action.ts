"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";
import { UpdateProfileSchema } from "@/lib/validations/user.validation";
import { z } from "zod";

export async function getProfileByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        location: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function getUserPosts(userId: string) {
  try {
    // Récupérer l'ID de l'utilisateur actuel pour filtrer les commentaires des bloqués
    const currentUserId = await getDbUserId();

    // Récupérer les IDs des utilisateurs bloqués
    let blockedUserIds: string[] = [];
    if (currentUserId) {
      const blocks = await prisma.block.findMany({
        where: { blockerId: currentUserId },
        select: { blockedId: true },
      });
      blockedUserIds = blocks.map(block => block.blockedId);
    }

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
          // Filtrer les commentaires des utilisateurs bloqués
          where: {
            authorId: {
              notIn: blockedUserIds.length > 0 ? blockedUserIds : undefined,
            },
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

    return posts;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
}

export async function getUserLikedPosts(userId: string) {
  try {
    // Récupérer l'ID de l'utilisateur actuel pour filtrer les commentaires des bloqués
    const currentUserId = await getDbUserId();

    // Récupérer les IDs des utilisateurs bloqués
    let blockedUserIds: string[] = [];
    if (currentUserId) {
      const blocks = await prisma.block.findMany({
        where: { blockerId: currentUserId },
        select: { blockedId: true },
      });
      blockedUserIds = blocks.map(block => block.blockedId);
    }

    const likedPosts = await prisma.like.findMany({
      where: { userId },
      include: {
        post: {
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
              // Filtrer les commentaires des utilisateurs bloqués
              where: {
                authorId: {
                  notIn: blockedUserIds.length > 0 ? blockedUserIds : undefined,
                },
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return likedPosts.map((like) => like.post);
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return [];
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const data = {
      name: formData.get("name") as string,
      bio: formData.get("bio") as string,
      location: formData.get("location") as string,
      website: formData.get("website") as string,
    };

    const validatedData = UpdateProfileSchema.parse(data);

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        name: validatedData.name,
        bio: validatedData.bio,
        location: validatedData.location,
        website: validatedData.website,
      },
    });

    revalidatePath("/profile");
    return { success: true, user };
  } catch (error) {
    console.error("Error updating profile:", error);

    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Données invalides"
      };
    }

    return { success: false, error: "Erreur lors de la mise à jour du profil" };
  }
}

export async function isFollowing(userId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return false;

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}
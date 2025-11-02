"use server";

import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Rechercher des utilisateurs par username ou name
 */
export async function searchUsers(query: string) {
  try {
    if (!query || query.trim().length < 1) {
      return { success: true, users: [], query };
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length > 100) {
      return {
        success: false,
        error: "Recherche trop longue (max 100 caractères)",
      };
    }

    logger.debug({
      context: "searchUsers",
      action: "Searching users",
      details: { query: trimmedQuery },
    });

    // ✅ CORRIGER: Utiliser la bonne relation
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: trimmedQuery, mode: "insensitive" } },
          { name: { contains: trimmedQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
      take: 10,
    });

    logger.debug({
      context: "searchUsers",
      action: "Search completed",
      details: { query: trimmedQuery, resultsCount: users.length },
    });

    return { success: true, users, query: trimmedQuery };
  } catch (error) {
    logger.error({
      context: "searchUsers",
      action: "Search failed",
      error,
    });

    return {
      success: false,
      error: "Erreur lors de la recherche d'utilisateurs",
    };
  }
}

/**
 * Rechercher des posts par contenu
 */
export async function searchPosts(query: string) {
  try {
    if (!query || query.trim().length < 1) {
      return { success: true, posts: [], query };
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length > 100) {
      return {
        success: false,
        error: "Recherche trop longue (max 100 caractères)",
      };
    }

    logger.debug({
      context: "searchPosts",
      action: "Searching posts",
      details: { query: trimmedQuery },
    });

    const posts = await prisma.post.findMany({
      where: {
        content: { contains: trimmedQuery, mode: "insensitive" },
      },
      select: {
        id: true,
        content: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
    });

    const serializedPosts = posts.map((post: any) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
    }));

    logger.debug({
      context: "searchPosts",
      action: "Search completed",
      details: { query: trimmedQuery, resultsCount: serializedPosts.length },
    });

    return { success: true, posts: serializedPosts, query: trimmedQuery };
  } catch (error) {
    logger.error({
      context: "searchPosts",
      action: "Search failed",
      error,
    });

    return {
      success: false,
      error: "Erreur lors de la recherche de posts",
    };
  }
}

/**
 * Recherche combinée (users + posts)
 */
export async function searchGlobal(query: string) {
  try {
    const [usersResult, postsResult] = await Promise.all([
      searchUsers(query),
      searchPosts(query),
    ]);

    return {
      success: usersResult.success && postsResult.success,
      users: usersResult.users || [],
      posts: postsResult.posts || [],
      query,
    };
  } catch (error) {
    logger.error({
      context: "searchGlobal",
      action: "Global search failed",
      error,
    });

    return {
      success: false,
      error: "Erreur lors de la recherche globale",
      users: [],
      posts: [],
      query,
    };
  }
}

/**
 * Rechercher tous les utilisateurs (pour la page Explorer)
 */
export async function getAllUsers() {
  try {
    logger.debug({
      context: "getAllUsers",
      action: "Fetching all users",
    });

    // ✅ CORRIGER: Enlever la sélection de followers
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    logger.debug({
      context: "getAllUsers",
      action: "Fetched all users",
      details: { count: users.length },
    });

    return users;
  } catch (error) {
    logger.error({
      context: "getAllUsers",
      action: "Failed to fetch users",
      error,
    });

    return [];
  }
}

/**
 * Rechercher des utilisateurs à suivre (suggestions)
 */
export async function getSuggestedUsers(
  currentUserId: string,
  limit: number = 5
) {
  try {
    logger.debug({
      context: "getSuggestedUsers",
      action: "Fetching suggested users",
      details: { currentUserId, limit },
    });

    const suggestedUsers = await prisma.user.findMany({
      where: {
        NOT: {
          id: currentUserId,
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      orderBy: {
        followers: {
          _count: "desc",
        },
      },
      take: limit,
    });

    logger.debug({
      context: "getSuggestedUsers",
      action: "Fetched suggested users",
      details: { count: suggestedUsers.length },
    });

    return suggestedUsers;
  } catch (error) {
    logger.error({
      context: "getSuggestedUsers",
      action: "Failed to fetch suggested users",
      error,
    });

    return [];
  }
}
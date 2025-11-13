// @ts-nocheck
import type { Ratelimit } from "@upstash/ratelimit";
import type { Redis } from "@upstash/redis";
import { logger } from "./logger";

/**
 * Configuration du Rate Limiting avec Upstash Redis
 *
 * IMPORTANT: Utilise dynamic imports pour éviter l'initialisation pendant le build
 */

// ============================================
// SAFE REDIS INITIALIZATION (DYNAMIC IMPORT)
// ============================================

let redisInstance: Redis | null = null;
let redisInitialized = false;

async function getRedis(): Promise<Redis | null> {
  if (redisInitialized) {
    return redisInstance;
  }

  try {
    // Vérifier les variables d'environnement AVANT toute tentative de connexion
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      redisInitialized = true;
      redisInstance = null;
      return null;
    }

    // Dynamic import pour éviter l'exécution pendant le build
    const { Redis } = await import("@upstash/redis");

    // Créer l'instance Redis avec les credentials explicites
    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    redisInitialized = true;
    return redisInstance;
  } catch (error) {
    // Silencieux - ne pas bloquer le build
    redisInitialized = true;
    redisInstance = null;
    return null;
  }
}

// ============================================
// LAZY RATE LIMITERS (NOT INITIALIZED AT IMPORT TIME)
// ============================================

let postRateLimitInstance: Ratelimit | null | undefined = undefined;
let messageRateLimitInstance: Ratelimit | null | undefined = undefined;
let commentRateLimitInstance: Ratelimit | null | undefined = undefined;
let likeRateLimitInstance: Ratelimit | null | undefined = undefined;
let uploadRateLimitInstance: Ratelimit | null | undefined = undefined;

/**
 * Rate limit pour les POSTS
 */
async function getPostRateLimit(): Promise<Ratelimit | null> {
  if (postRateLimitInstance !== undefined) {
    return postRateLimitInstance;
  }

  try {
    const redis = await getRedis();
    if (!redis) {
      postRateLimitInstance = null;
      return null;
    }

    const { Ratelimit } = await import("@upstash/ratelimit");

    postRateLimitInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "ratelimit:post",
    });
    return postRateLimitInstance;
  } catch {
    postRateLimitInstance = null;
    return null;
  }
}

export const postRateLimit = { get: getPostRateLimit };

/**
 * Rate limit pour les MESSAGES
 */
async function getMessageRateLimit(): Promise<Ratelimit | null> {
  if (messageRateLimitInstance !== undefined) {
    return messageRateLimitInstance;
  }

  try {
    const redis = await getRedis();
    if (!redis) {
      messageRateLimitInstance = null;
      return null;
    }

    const { Ratelimit } = await import("@upstash/ratelimit");

    messageRateLimitInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "10 s"),
      analytics: true,
      prefix: "ratelimit:message",
    });
    return messageRateLimitInstance;
  } catch {
    messageRateLimitInstance = null;
    return null;
  }
}

export const messageRateLimit = { get: getMessageRateLimit };

/**
 * Rate limit pour les COMMENTAIRES
 */
async function getCommentRateLimit(): Promise<Ratelimit | null> {
  if (commentRateLimitInstance !== undefined) {
    return commentRateLimitInstance;
  }

  try {
    const redis = await getRedis();
    if (!redis) {
      commentRateLimitInstance = null;
      return null;
    }

    const { Ratelimit } = await import("@upstash/ratelimit");

    commentRateLimitInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(15, "10 s"),
      analytics: true,
      prefix: "ratelimit:comment",
    });
    return commentRateLimitInstance;
  } catch {
    commentRateLimitInstance = null;
    return null;
  }
}

export const commentRateLimit = { get: getCommentRateLimit };

/**
 * Rate limit pour les LIKES
 */
async function getLikeRateLimit(): Promise<Ratelimit | null> {
  if (likeRateLimitInstance !== undefined) {
    return likeRateLimitInstance;
  }

  try {
    const redis = await getRedis();
    if (!redis) {
      likeRateLimitInstance = null;
      return null;
    }

    const { Ratelimit } = await import("@upstash/ratelimit");

    likeRateLimitInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "10 s"),
      analytics: true,
      prefix: "ratelimit:like",
    });
    return likeRateLimitInstance;
  } catch {
    likeRateLimitInstance = null;
    return null;
  }
}

export const likeRateLimit = { get: getLikeRateLimit };

/**
 * Rate limit pour les UPLOADS D'IMAGES
 */
async function getUploadRateLimit(): Promise<Ratelimit | null> {
  if (uploadRateLimitInstance !== undefined) {
    return uploadRateLimitInstance;
  }

  try {
    const redis = await getRedis();
    if (!redis) {
      uploadRateLimitInstance = null;
      return null;
    }

    const { Ratelimit } = await import("@upstash/ratelimit");

    uploadRateLimitInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "ratelimit:upload",
    });
    return uploadRateLimitInstance;
  } catch {
    uploadRateLimitInstance = null;
    return null;
  }
}

export const uploadRateLimit = { get: getUploadRateLimit };

/**
 * Fonction générique pour appliquer le rate limit
 * Retourne { success, remaining, resetAfter }
 */
export async function checkRateLimit(
  limiter: { get: () => Promise<Ratelimit | null> } | Ratelimit | null,
  identifier: string,
  context: string
): Promise<{ success: boolean; remaining: number; resetAfter: number }> {
  // Obtenir l'instance réelle du limiter
  const actualLimiter = limiter && typeof limiter === 'object' && 'get' in limiter
    ? await limiter.get()
    : limiter;

  // Si le limiter est null, laisser passer
  if (!actualLimiter) {
    return {
      success: true,
      remaining: -1,
      resetAfter: 0,
    };
  }

  try {
    const result = await actualLimiter.limit(identifier);

    // Calculer le temps d'attente avant reset (en millisecondes)
    // result.reset est un timestamp en ms, on calcule la différence avec now
    const resetAfter = result.reset ? result.reset - Date.now() : 0;

    if (!result.success) {
      logger.warn({
        context: "RateLimit",
        action: `Rate limit exceeded for ${context}`,
        details: {
          identifier,
          resetAfter: Math.ceil(resetAfter / 1000), // Convertir en secondes pour le logging
          remaining: result.remaining,
        },
      });
    } else {
      logger.debug({
        context: "RateLimit",
        action: `Rate limit check passed for ${context}`,
        details: {
          identifier,
          remaining: result.remaining,
        },
      });
    }

    return {
      success: result.success,
      remaining: result.remaining,
      resetAfter: Math.max(0, resetAfter), // Éviter les négatifs
    };
  } catch (error) {
    logger.error({
      context: "RateLimit",
      action: `Rate limit check failed for ${context}`,
      error,
      details: { identifier },
    });

    // En cas d'erreur, laisser passer (fail-open)
    // Mieux vaut permettre l'action que de bloquer l'utilisateur
    return {
      success: true,
      remaining: -1,
      resetAfter: 0,
    };
  }
}

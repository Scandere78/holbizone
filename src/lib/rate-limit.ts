// @ts-nocheck
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "./logger";

/**
 * Configuration du Rate Limiting avec Upstash Redis
 *
 * IMPORTANT: Toutes les erreurs sont silencieuses pour ne jamais bloquer le build
 */

// ============================================
// SAFE REDIS INITIALIZATION (LAZY)
// ============================================

let redisInstance: Redis | null = null;
let redisInitialized = false;

function getRedis(): Redis | null {
  // Skip during build time
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !process.env.UPSTASH_REDIS_REST_URL) {
    return null;
  }

  if (redisInitialized) {
    return redisInstance;
  }

  try {
    // Vérifier les variables d'environnement
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      redisInitialized = true;
      return null;
    }

    redisInstance = Redis.fromEnv();
    redisInitialized = true;
    return redisInstance;
  } catch (error) {
    // Silencieux - ne pas bloquer le build
    redisInitialized = true;
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
function getPostRateLimit(): Ratelimit | null {
  if (postRateLimitInstance !== undefined) {
    return postRateLimitInstance;
  }

  try {
    const redis = getRedis();
    if (!redis) {
      postRateLimitInstance = null;
      return null;
    }

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
function getMessageRateLimit(): Ratelimit | null {
  if (messageRateLimitInstance !== undefined) {
    return messageRateLimitInstance;
  }

  try {
    const redis = getRedis();
    if (!redis) {
      messageRateLimitInstance = null;
      return null;
    }

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
function getCommentRateLimit(): Ratelimit | null {
  if (commentRateLimitInstance !== undefined) {
    return commentRateLimitInstance;
  }

  try {
    const redis = getRedis();
    if (!redis) {
      commentRateLimitInstance = null;
      return null;
    }

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
function getLikeRateLimit(): Ratelimit | null {
  if (likeRateLimitInstance !== undefined) {
    return likeRateLimitInstance;
  }

  try {
    const redis = getRedis();
    if (!redis) {
      likeRateLimitInstance = null;
      return null;
    }

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
function getUploadRateLimit(): Ratelimit | null {
  if (uploadRateLimitInstance !== undefined) {
    return uploadRateLimitInstance;
  }

  try {
    const redis = getRedis();
    if (!redis) {
      uploadRateLimitInstance = null;
      return null;
    }

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
  limiter: { get: () => Ratelimit | null } | Ratelimit | null,
  identifier: string,
  context: string
): Promise<{ success: boolean; remaining: number; resetAfter: number }> {
  // Obtenir l'instance réelle du limiter
  const actualLimiter = limiter && typeof limiter === 'object' && 'get' in limiter
    ? limiter.get()
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

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
// SAFE REDIS INITIALIZATION
// ============================================

let redisInstance: Redis | null = null;

function getRedis(): Redis | null {
  if (redisInstance) {
    return redisInstance;
  }
  
  try {
    // Vérifier les variables d'environnement
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return null;
    }
    
    redisInstance = Redis.fromEnv();
    return redisInstance;
  } catch (error) {
    // Silencieux - ne pas bloquer le build
    return null;
  }
}

// ============================================
// DIFFÉRENTES STRATÉGIES DE RATE LIMITING
// ============================================

/**
 * Rate limit pour les POSTS
 */
function createPostRateLimit() {
  try {
    const redis = getRedis();
    if (!redis) return null;

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "ratelimit:post",
    });
  } catch {
    return null;
  }
}

export const postRateLimit = createPostRateLimit();

/**
 * Rate limit pour les MESSAGES
 */
function createMessageRateLimit() {
  try {
    const redis = getRedis();
    if (!redis) return null;

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "10 s"),
      analytics: true,
      prefix: "ratelimit:message",
    });
  } catch {
    return null;
  }
}

export const messageRateLimit = createMessageRateLimit();

/**
 * Rate limit pour les COMMENTAIRES
 */
function createCommentRateLimit() {
  try {
    const redis = getRedis();
    if (!redis) return null;

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(15, "10 s"),
      analytics: true,
      prefix: "ratelimit:comment",
    });
  } catch {
    return null;
  }
}

export const commentRateLimit = createCommentRateLimit();

/**
 * Rate limit pour les LIKES
 */
function createLikeRateLimit() {
  try {
    const redis = getRedis();
    if (!redis) return null;

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "10 s"),
      analytics: true,
      prefix: "ratelimit:like",
    });
  } catch {
    return null;
  }
}

export const likeRateLimit = createLikeRateLimit();

/**
 * Rate limit pour les UPLOADS D'IMAGES
 */
function createUploadRateLimit() {
  try {
    const redis = getRedis();
    if (!redis) return null;

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "ratelimit:upload",
    });
  } catch {
    return null;
  }
}

export const uploadRateLimit = createUploadRateLimit();

/**
 * Fonction générique pour appliquer le rate limit
 * Retourne { success, remaining, resetAfter }
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
  context: string
): Promise<{ success: boolean; remaining: number; resetAfter: number }> {
  // Si le limiter est null, laisser passer
  if (!limiter) {
    return {
      success: true,
      remaining: -1,
      resetAfter: 0,
    };
  }

  try {
    const result = await limiter.limit(identifier);

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

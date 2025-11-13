// @ts-nocheck
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "./logger";

/**
 * Configuration du Rate Limiting avec Upstash Redis
 *
 * IMPORTANT: Redis est désactivé pendant le build Next.js
 * pour éviter les erreurs "Options object must provide a cluster"
 */

// ✅ Désactiver Redis pendant le build (NODE_ENV !== 'production' en build)
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.CI === 'true' ||
                    !process.env.NODE_ENV;

// ✅ Vérifier que les variables d'environnement sont présentes
export const hasRedisConfig = !isBuildTime && !!(
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// ============================================
// LAZY INITIALIZATION - N'initialise Redis qu'au runtime
// ============================================

let redisInstance: Redis | null = null;

function getRedis(): Redis | null {
  // Ne JAMAIS initialiser Redis pendant le build
  if (isBuildTime || !hasRedisConfig) {
    return null;
  }
  
  if (!redisInstance) {
    try {
      redisInstance = Redis.fromEnv();
    } catch (error) {
      logger.error({
        context: "RateLimit",
        action: "Failed to initialize Redis",
        error,
      });
      return null;
    }
  }
  
  return redisInstance;
}

// ============================================
// DIFFÉRENTES STRATÉGIES DE RATE LIMITING
// ============================================

/**
 * Rate limit pour les POSTS
 * Limite: 10 posts par 10 secondes par utilisateur
 * Idéal pour: Éviter le spam de posts
 */
function createPostRateLimit() {
  const redis = getRedis();
  if (!redis) return null;
  
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "ratelimit:post",
  });
}

export const postRateLimit = createPostRateLimit();

/**
 * Rate limit pour les MESSAGES
 * Limite: 20 messages par 10 secondes par utilisateur
 * Idéal pour: Éviter le spam de messages (plus rapide que posts)
 */
function createMessageRateLimit() {
  const redis = getRedis();
  if (!redis) return null;
  
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "10 s"),
    analytics: true,
    prefix: "ratelimit:message",
  });
}

export const messageRateLimit = createMessageRateLimit();

/**
 * Rate limit pour les COMMENTAIRES
 * Limite: 15 commentaires par 10 secondes par utilisateur
 * Idéal pour: Éviter le spam de commentaires
 */
function createCommentRateLimit() {
  const redis = getRedis();
  if (!redis) return null;
  
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, "10 s"),
    analytics: true,
    prefix: "ratelimit:comment",
  });
}

export const commentRateLimit = createCommentRateLimit();

/**
 * Rate limit pour les LIKES
 * Limite: 50 likes par 10 secondes par utilisateur
 * Idéal pour: Éviter les attaques de like automatiques
 */
function createLikeRateLimit() {
  const redis = getRedis();
  if (!redis) return null;
  
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "10 s"),
    analytics: true,
    prefix: "ratelimit:like",
  });
}

export const likeRateLimit = createLikeRateLimit();

/**
 * Rate limit pour les UPLOADS D'IMAGES
 * Limite: 5 uploads par 60 secondes par utilisateur
 * Idéal pour: Éviter les uploads massifs
 */
function createUploadRateLimit() {
  const redis = getRedis();
  if (!redis) return null;
  
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "ratelimit:upload",
  });
}

export const uploadRateLimit = createUploadRateLimit();

/**
 * Fonction générique pour appliquer le rate limit
 * Retourne { success, remaining, resetAfter }
 *
 * @param limiter - L'instance de Ratelimit (peut être null si Redis non configuré)
 * @param identifier - ID unique (userId, IP, etc.)
 * @param context - Contexte pour le logging
 * @returns Résultat du rate limit
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
  context: string
): Promise<{ success: boolean; remaining: number; resetAfter: number }> {
  // Si le limiter est null ou Redis n'est pas configuré, laisser passer
  if (!limiter || !hasRedisConfig) {
    logger.warn({
      context: "RateLimit",
      action: `Rate limiting disabled for ${context} (no Redis configured)`,
      details: { identifier },
    });
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

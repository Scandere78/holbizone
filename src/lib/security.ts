import DOMPurify from "isomorphic-dompurify";
import { logger } from "./logger";

/**
 * Configuration de sanitisation HTML
 * Nettoie le contenu utilisateur pour éviter les XSS attacks
 */
const SANITIZATION_CONFIG = {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "br", "p", "ul", "li", "ol"],
  ALLOWED_ATTR: ["href", "title", "target"],
};

/**
 * Sanitiser le contenu HTML
 * Supprime les balises dangereuses (script, onclick, etc.)
 * 
 * @param dirty - Contenu HTML brut
 * @returns Contenu HTML sécurisé
 */
export function sanitizeHtml(dirty: string): string {
  try {
    const clean = DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: SANITIZATION_CONFIG.ALLOWED_TAGS,
      ALLOWED_ATTR: SANITIZATION_CONFIG.ALLOWED_ATTR,
      KEEP_CONTENT: true,
    });

    logger.debug({
      context: "Security",
      action: "HTML sanitized",
      details: {
        originalLength: dirty.length,
        cleanLength: clean.length,
      },
    });

    return clean;
  } catch (error) {
    logger.error({
      context: "Security",
      action: "HTML sanitization failed",
      error,
    });
    // Retourner le texte brut en cas d'erreur
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
  }
}

/**
 * Valider les uploads d'images
 * Vérifie le type MIME et la taille du fichier
 * 
 * @param file - Fichier uploadé
 * @returns { valid: boolean, error?: string }
 */
export function validateImageUpload(file: File): {
  valid: boolean;
  error?: string;
} {
  // Configuration des limites
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  try {
    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      logger.warn({
        context: "Security",
        action: "Image upload rejected - too large",
        details: {
          fileName: file.name,
          fileSize: file.size,
          maxSize: MAX_FILE_SIZE,
        },
      });
      return {
        valid: false,
        error: `Le fichier est trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
      };
    }

    // Vérifier le type MIME
    if (!ALLOWED_TYPES.includes(file.type)) {
      logger.warn({
        context: "Security",
        action: "Image upload rejected - invalid type",
        details: {
          fileName: file.name,
          fileType: file.type,
        },
      });
      return {
        valid: false,
        error: `Type de fichier non autorisé. Formats acceptés: ${ALLOWED_TYPES.join(", ")}`,
      };
    }

    logger.debug({
      context: "Security",
      action: "Image upload validated",
      details: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    });

    return { valid: true };
  } catch (error) {
    logger.error({
      context: "Security",
      action: "Image validation failed",
      error,
      details: { fileName: file.name },
    });

    return {
      valid: false,
      error: "Erreur lors de la validation du fichier",
    };
  }
}

/**
 * Générer un token CSRF
 * À implémenter avec cookies sécurisés
 */
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Valider les URL (éviter les redirects malveillants)
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Seulement les protocoles HTTP(S) sont autorisés
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
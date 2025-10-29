import { z } from "zod";
import { validateImageUpload } from "@/lib/security";

/**
 * Schéma Zod pour valider les uploads d'images
 * Utilisé dans les actions serveur
 */
export const ImageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "Le fichier doit faire moins de 10MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type
        ),
      "Le format doit être JPEG, PNG, WebP ou GIF"
    ),
});

/**
 * Valider l'upload d'image
 * À utiliser avant d'appeler UploadThing
 */
export async function validateAndSanitizeImage(file: File) {
  try {
    // Valider avec Zod
    ImageUploadSchema.parse({ file });

    // Valider avec la fonction de sécurité
    const validation = validateImageUpload(file);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    return {
      success: true,
      file,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }

    return {
      success: false,
      error: "Erreur lors de la validation",
    };
  }
}
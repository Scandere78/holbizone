import { z } from "zod";

/**
 * Schéma de validation pour créer un post
 * - content: texte du post (1-500 caractères)
 * - image: URL de l'image (optionnel, depuis UploadThing)
 */
export const CreatePostSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu ne peut pas être vide")
    .max(500, "Le contenu ne peut pas dépasser 500 caractères")
    .trim(),

  // ✅ CORRECT: image est optionnelle ET peut être une URL
  image: z
    .string()
    .url("L'URL de l'image est invalide") // ⬅️ Valider que c'est une URL
    .optional() // ⬅️ Peut être vide
    .or(z.literal("")) // ⬅️ Accepter les strings vides
    .transform((val) => (val === "" ? undefined : val)), // ⬅️ Transformer "" en undefined
});
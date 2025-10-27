import { z } from "zod";

export const CreatePostSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu ne peut pas être vide")
    .max(500, "Le contenu ne peut pas dépasser 500 caractères")
    .trim(),
  image: z.string().url("L'URL de l'image est invalide").optional(),
});

export const EditPostSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu ne peut pas être vide")
    .max(500, "Le contenu ne peut pas dépasser 500 caractères")
    .trim(),
  image: z.string().url("L'URL de l'image est invalide").optional(),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type EditPostInput = z.infer<typeof EditPostSchema>;
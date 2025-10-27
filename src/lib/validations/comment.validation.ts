import { z } from "zod";

export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Le commentaire ne peut pas être vide")
    .max(300, "Le commentaire ne peut pas dépasser 300 caractères")
    .trim(),
  postId: z.string().cuid("ID de post invalide"),
});

export const EditCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Le commentaire ne peut pas être vide")
    .max(300, "Le commentaire ne peut pas dépasser 300 caractères")
    .trim(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type EditCommentInput = z.infer<typeof EditCommentSchema>;
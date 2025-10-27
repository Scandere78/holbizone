import { z } from "zod";

export const SendMessageSchema = z.object({
  conversationId: z.string().cuid("ID de conversation invalide"),
  content: z
    .string()
    .min(1, "Le message ne peut pas être vide")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères")
    .trim(),
  image: z.string().url("L'URL de l'image est invalide").optional(),
});

export const CreateConversationSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom ne peut pas être vide")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .optional(),
  memberIds: z
    .array(z.string().cuid("ID d'utilisateur invalide"))
    .min(1, "Au moins un membre est requis"),
  image: z.string().url("L'URL de l'image est invalide").optional(),
  isGroup: z.boolean().default(false),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .optional(),
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
    )
    .optional(),
  bio: z
    .string()
    .max(160, "La bio ne peut pas dépasser 160 caractères")
    .optional(),
  location: z
    .string()
    .max(50, "La localisation ne peut pas dépasser 50 caractères")
    .optional(),
  website: z
    .string()
    .url("L'URL du site web est invalide")
    .optional()
    .or(z.literal("")),
  image: z.string().url("L'URL de l'image est invalide").optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { logger } from "@/lib/logger";
import { z } from "zod";

// Schema de validation
const ReclamationSchema = z.object({
  type: z.enum(["bug", "feature", "improvement", "other"]),
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères").max(100),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères").max(1000),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export async function createReclamation(data: {
  type: "bug" | "feature" | "improvement" | "other";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
}) {
  try {
    // Validation
    const validatedData = ReclamationSchema.parse(data);

    // Obtenir l'utilisateur connecté
    const userId = await getDbUserId();
    if (!userId) {
      return { success: false, error: "Vous devez être connecté" };
    }

    // Mapping pour les enums Prisma (en MAJUSCULES)
    const typeMap = {
      bug: "BUG",
      feature: "FEATURE",
      improvement: "IMPROVEMENT",
      other: "OTHER",
    } as const;

    const priorityMap = {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
    } as const;

    // Créer la réclamation
    const reclamation = await prisma.reclamation.create({
      data: {
        type: typeMap[validatedData.type],
        title: validatedData.title,
        description: validatedData.description,
        priority: priorityMap[validatedData.priority || "medium"],
        userId,
        status: "PENDING",
      },
    });

    logger.info({
      context: "createReclamation",
      action: "Réclamation créée",
      details: { reclamationId: reclamation.id, userId },
    });

    return { success: true, reclamation };
  } catch (error) {
    logger.error({
      context: "createReclamation",
      action: "Erreur lors de la création",
      error,
    });

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Données invalides",
      };
    }

    return { success: false, error: "Erreur lors de la création de la réclamation" };
  }
}

export async function getUserReclamations() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const reclamations = await prisma.reclamation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return reclamations;
  } catch (error) {
    logger.error({
      context: "getUserReclamations",
      action: "Erreur lors de la récupération",
      error,
    });
    return [];
  }
}

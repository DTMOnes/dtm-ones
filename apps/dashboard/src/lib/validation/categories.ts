import { z } from "zod";

export const categorySchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "Máximo 100 caracteres."),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "Máximo 100 caracteres."),
});

export const updateCategorySchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .trim()
    .min(1, "The name is required.")
    .max(100, "Maximum 100 characters."),
});

export const deleteCategorySchema = categorySchema.pick({
  id: true,
});

export const removePlayerFromCategorySchema = z.object({
  categoryId: z.uuid(),
  playerId: z.uuid(),
});

export type CategoryData = z.infer<typeof categorySchema>;

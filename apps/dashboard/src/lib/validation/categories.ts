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

export type CategoryData = z.infer<typeof categorySchema>;

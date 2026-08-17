import { z } from "zod";

const categoryNameSchema = z.string().trim().min(1);

export const createCategorySchema = z.object({
  name: categoryNameSchema,
});

export const renameCategorySchema = z.object({
  id: z.uuid(),
  name: categoryNameSchema,
});

export const deleteCategorySchema = z.object({
  id: z.uuid(),
});

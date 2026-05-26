"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

import { createCategorySchema } from "@/lib/validation/categories";

export const createCategory = actionClient
  .metadata({ actionName: "createCategory" })
  .inputSchema(createCategorySchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const data = parsedInput;

    const newCategory = await db.insert(categories).values(data).returning();

    if (!newCategory) {
      throw new Error("Error al crear la categoría.");
    }

    return {
      success: true,
      message: "Categoría creada correctamente.",
    };
  });

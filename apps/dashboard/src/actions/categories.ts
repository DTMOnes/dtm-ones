"use server";

import { revalidatePath } from "next/cache";

import { authClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";

import { db } from "@/lib/db";
import { categories, playerCategories } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  removePlayerFromCategorySchema,
} from "@/lib/validation/categories";

export const createCategory = authClient
  .metadata({ actionName: "createCategory" })
  .inputSchema(createCategorySchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const [newCategory] = await db
      .insert(categories)
      .values(parsedInput)
      .returning();

    if (!newCategory) {
      throw new Error("Could not create the category.");
    }

    revalidatePath("/categories");

    return { message: "Category created successfully." };
  });

export const updateCategory = authClient
  .metadata({ actionName: "updateCategory" })
  .inputSchema(updateCategorySchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const { id, name } = parsedInput;

    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!existingCategory) {
      throw new Error("Categoría no encontrada.");
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      throw new Error("Categoría no encontrada.");
    }

    revalidatePath("/categories");
    revalidatePath(`/categories/${id}`);

    return {
      success: true,
      message: "Categoría actualizada correctamente.",
    };
  });

export const deleteCategory = authClient
  .metadata({ actionName: "deleteCategory" })
  .inputSchema(deleteCategorySchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, parsedInput.id),
    });

    if (!existingCategory) {
      throw new Error("Categoría no encontrada.");
    }

    await db.delete(categories).where(eq(categories.id, parsedInput.id));

    revalidatePath("/categories");

    return {
      success: true,
      message: "Categoría eliminada correctamente.",
    };
  });

export const removePlayerFromCategory = authClient
  .metadata({ actionName: "removePlayerFromCategory" })
  .inputSchema(removePlayerFromCategorySchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const { categoryId, playerId } = parsedInput;

    const deleted = await db
      .delete(playerCategories)
      .where(
        and(
          eq(playerCategories.categoryId, categoryId),
          eq(playerCategories.playerId, playerId),
        ),
      )
      .returning();

    if (!deleted.length) {
      throw new Error("El jugador no pertenece a esta categoría.");
    }

    revalidatePath("/categories");
    revalidatePath(`/categories/${categoryId}`);
    revalidatePath(`/players/${playerId}`);

    return {
      success: true,
      message: "Jugador quitado de la categoría.",
    };
  });

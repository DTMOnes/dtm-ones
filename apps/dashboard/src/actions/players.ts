"use server";

// Safe Action
import { authClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";

// Database
import { db } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Schema
import { players, playerCategories, categories } from "@/lib/db/schema";

// Validation Schema
import {
  createPlayerSchema,
  updatePlayerSchema,
} from "@/lib/validation/players";

export const createPlayer = authClient
  .metadata({ actionName: "createPlayer" })
  .inputSchema(createPlayerSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const { categoryIds, ...data } = parsedInput;

    if (categoryIds.length > 0) {
      const existingCategories = await db.query.categories.findMany({
        where: inArray(categories.id, categoryIds),
      });

      if (existingCategories.length !== categoryIds.length) {
        throw new Error("Categoría no encontrada.");
      }
    }

    const [newPlayer] = await db
      .insert(players)
      .values({ ...data })
      .returning();

    if (!newPlayer) {
      throw new Error("Error al crear el jugador.");
    }

    if (categoryIds.length > 0) {
      try {
        await db.insert(playerCategories).values(
          categoryIds.map((categoryId) => ({
            playerId: newPlayer.id,
            categoryId,
          })),
        );
      } catch (error) {
        await db.delete(players).where(eq(players.id, newPlayer.id));
        throw error;
      }
    }

    return { message: "Player created successfully." };
  });

export const updatePlayer = authClient
  .metadata({ actionName: "updatePlayer" })
  .inputSchema(updatePlayerSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const { id, playerCategories: categoryIds, ...data } = parsedInput;

    await db.transaction(async (tx) => {
      const [updatedPlayer] = await tx
        .update(players)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(players.id, id))
        .returning();

      if (!updatedPlayer) {
        throw new Error("Jugador no encontrado.");
      }

      await tx
        .delete(playerCategories)
        .where(eq(playerCategories.playerId, id));

      for (const categoryId of categoryIds) {
        const existingCategory = await tx.query.categories.findFirst({
          where: eq(categories.id, categoryId),
        });

        if (!existingCategory) {
          throw new Error("Categoría no encontrada.");
        }

        await tx.insert(playerCategories).values({
          playerId: id,
          categoryId: existingCategory.id,
        });
      }
    });

    revalidatePath(`/dashboard/players/${id}`);
    revalidatePath("/dashboard/players");

    return {
      success: true,
      message: "Jugador actualizado correctamente.",
    };
  });

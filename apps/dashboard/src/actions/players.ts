"use server";

// Safe Action
import { actionClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";

// Database
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Schema
import { players, playerCategories, categories } from "@/lib/db/schema";

// Validation Schema
import {
  createPlayerSchema,
  updatePlayerSchema,
} from "@/lib/validation/players";

export const createPlayer = actionClient
  .metadata({ actionName: "createPlayer" })
  .inputSchema(createPlayerSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const { playerCategories: array, ...data } = parsedInput;

    await db.transaction(async (tx) => {
      const [newPlayer] = await tx
        .insert(players)
        .values({ ...data })
        .returning();

      if (!newPlayer) {
        throw new Error("Error al crear el jugador.");
      }

      for (const cat of array) {
        const existingCategory = await tx.query.categories.findFirst({
          where: eq(categories.id, cat),
        });

        if (!existingCategory) {
          throw new Error("Categoría no encontrada.");
        }

        await tx.insert(playerCategories).values({
          playerId: newPlayer.id,
          categoryId: existingCategory.id,
        });
      }

      return newPlayer;
    });

    return {
      success: true,
      message: "Jugador creado correctamente.",
    };
  });

export const updatePlayer = actionClient
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

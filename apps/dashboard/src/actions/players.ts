"use server";

// Safe Action
import { authClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";

// Database
import { db } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Vercel Blob
import { del } from "@vercel/blob";

// Schema
import { players, playerCategories, categories } from "@/lib/db/schema";

// Validation Schema
import {
  createPlayerSchema,
  updatePlayerSchema,
  deletePlayerSchema,
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
        throw new Error("Category not found.");
      }
    }

    const [newPlayer] = await db
      .insert(players)
      .values({ ...data })
      .returning();

    if (!newPlayer) {
      throw new Error("Failed to create player.");
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
    const { id: playerId, categoryIds, ...changes } = parsedInput;

    const existingPlayer = await db.query.players.findFirst({
      where: eq(players.id, playerId),
    });

    if (!existingPlayer) {
      throw new Error("Player not found.");
    }

    const [updatedPlayer] = await db
      .update(players)
      .set({
        ...changes,
        updatedAt: new Date(),
      })
      .where(eq(players.id, playerId))
      .returning();

    if (!updatedPlayer) {
      throw new Error("Player not found.");
    }

    if (categoryIds !== undefined) {
      if (categoryIds.length > 0) {
        const existingCategories = await db.query.categories.findMany({
          where: inArray(categories.id, categoryIds),
        });

        if (existingCategories.length !== categoryIds.length) {
          throw new Error("Category not found.");
        }
      }

      await db
        .delete(playerCategories)
        .where(eq(playerCategories.playerId, playerId));

      if (categoryIds.length > 0) {
        await db.insert(playerCategories).values(
          categoryIds.map((categoryId) => ({
            playerId,
            categoryId,
          })),
        );
      }
    }

    revalidatePath(`/players/${playerId}`);
    revalidatePath("/players");

    return { message: "Player updated successfully." };
  });

export const deletePlayer = authClient
  .metadata({ actionName: "deletePlayer" })
  .inputSchema(deletePlayerSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const player = await db.query.players.findFirst({
      where: eq(players.id, parsedInput.id),
      with: {
        playerMedia: true,
      },
    });

    if (!player) {
      throw new Error("Player not found.");
    }

    const imageUrls = player.playerMedia
      .filter((media) => media.mediaType === "image")
      .map((media) => media.url);

    await Promise.all(imageUrls.map((url) => del(url)));

    await db.delete(players).where(eq(players.id, parsedInput.id));

    revalidatePath("/players");

    return { message: "Player deleted successfully." };
  });

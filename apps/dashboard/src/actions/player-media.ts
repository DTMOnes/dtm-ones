"use server";

// Safe Action
import { actionClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";

// Database
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Vercel Blob
import { del } from "@vercel/blob";

// Schema
import { players, playerMedia } from "@/lib/db/schema";

// Validation Schema
import {
  uploadPlayerImageSchema,
  uploadPlayerVideoSchema,
  deletePlayerImageSchema,
  deletePlayerVideoSchema,
} from "@/lib/validation/player-media";

const blobImageMediaTypes = ["image", "institutional_picture"];

export const uploadPlayerImage = actionClient
  .metadata({ actionName: "uploadPlayerImage" })
  .inputSchema(uploadPlayerImageSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const { playerId, mediaType, url } = parsedInput;

    const existingPlayer = await db.query.players.findFirst({
      where: eq(players.id, playerId),
    });

    if (!existingPlayer) {
      throw new Error("Player not found.");
    }

    await db.insert(playerMedia).values({
      playerId: existingPlayer.id,
      mediaType,
      url,
    });

    revalidatePath(`/dashboard/players/${playerId}`);

    return { message: "Media added successfully." };
  });

export const deletePlayerImage = actionClient
  .metadata({ actionName: "deletePlayerImage" })
  .inputSchema(deletePlayerImageSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const mediaToDelete = await db.query.playerMedia.findFirst({
      where: eq(playerMedia.id, parsedInput.id),
    });

    if (!mediaToDelete) {
      throw new Error("Image not found.");
    }

    if (!blobImageMediaTypes.includes(mediaToDelete.mediaType)) {
      throw new Error("Only images can be deleted with this action.");
    }

    await del(mediaToDelete.url);

    await db.delete(playerMedia).where(eq(playerMedia.id, parsedInput.id));

    revalidatePath(`/dashboard/players/${mediaToDelete.playerId}`);

    return { message: "Image deleted successfully." };
  });

export const uploadPlayerVideo = actionClient
  .metadata({ actionName: "uploadPlayerVideo" })
  .inputSchema(uploadPlayerVideoSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const { playerId, url } = parsedInput;

    const existingPlayer = await db.query.players.findFirst({
      where: eq(players.id, playerId),
    });

    if (!existingPlayer) {
      throw new Error("Player not found.");
    }

    await db.insert(playerMedia).values({
      playerId: existingPlayer.id,
      mediaType: "video",
      url,
    });

    revalidatePath(`/dashboard/players/${playerId}`);

    return { message: "Video added successfully." };
  });

export const deletePlayerVideo = actionClient
  .metadata({ actionName: "deletePlayerVideo" })
  .inputSchema(deletePlayerVideoSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const mediaToDelete = await db.query.playerMedia.findFirst({
      where: eq(playerMedia.id, parsedInput.id),
    });

    if (!mediaToDelete) {
      throw new Error("Video not found.");
    }

    if (mediaToDelete.mediaType !== "video") {
      throw new Error("Only videos can be deleted with this action.");
    }

    await db.delete(playerMedia).where(eq(playerMedia.id, parsedInput.id));

    revalidatePath(`/dashboard/players/${mediaToDelete.playerId}`);

    return { message: "Video deleted successfully." };
  });

"use server";

// Safe Action
import { actionClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";

// Database
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Schema
import { players, playerMedia } from "@/lib/db/schema";

// Supabase
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Validation Schema
import {
  createPlayerMediaSchema,
  deletePlayerMediaSchema,
} from "@/lib/validation/player-media";

export const createPlayerMedia = actionClient
  .metadata({ actionName: "createPlayerMedia" })
  .inputSchema(createPlayerMediaSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const { playerId, ...data } = parsedInput;

    const existingPlayer = await db.query.players.findFirst({
      where: eq(players.id, playerId),
    });

    if (!existingPlayer) {
      throw new Error("Jugador no encontrado.");
    }

    await db.insert(playerMedia).values({
      playerId,
      ...data,
    });

    revalidatePath(`/dashboard/players/${playerId}`);

    return {
      success: true,
      message: "Media agregada correctamente.",
    };
  });

export const deletePlayerMedia = actionClient
  .metadata({ actionName: "deletePlayerMedia" })
  .inputSchema(deletePlayerMediaSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const mediaToDelete = await db.query.playerMedia.findFirst({
      where: eq(playerMedia.id, parsedInput.id),
    });

    if (!mediaToDelete) {
      throw new Error("Asset no encontrado.");
    }

    const supabase = await createSupabaseServerClient();
    const { error: storageError } = await supabase.storage
      .from("public-assets")
      .remove([mediaToDelete.storagePath]);

    if (storageError) {
      throw new Error("No se pudo eliminar el archivo en almacenamiento.");
    }

    await db.delete(playerMedia).where(eq(playerMedia.id, parsedInput.id));

    revalidatePath(`/dashboard/players/${mediaToDelete.playerId}`);

    return {
      success: true,
      message: "Asset eliminado correctamente.",
    };
  });

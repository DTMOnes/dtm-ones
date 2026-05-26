"use server";

// Safe Action
import { actionClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";

// Database
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Schema
import { landingMedia } from "@/lib/db/schema";

// Supabase
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Validation Schema
import {
  createLandingMediaSchema,
  deleteLandingMediaSchema,
} from "@/lib/validation/landing-media";

export const createLandingMedia = actionClient
  .metadata({ actionName: "createLandingMedia" })
  .inputSchema(createLandingMediaSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    await db.insert(landingMedia).values(parsedInput);

    revalidatePath("/dashboard/landing");

    return {
      success: true,
      message: "Media agregada correctamente.",
    };
  });

export const deleteLandingMedia = actionClient
  .metadata({ actionName: "deleteLandingMedia" })
  .inputSchema(deleteLandingMediaSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }) => {
    const mediaToDelete = await db.query.landingMedia.findFirst({
      where: eq(landingMedia.id, parsedInput.id),
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

    await db.delete(landingMedia).where(eq(landingMedia.id, parsedInput.id));

    revalidatePath("/dashboard/landing");

    return {
      success: true,
      message: "Asset eliminado correctamente.",
    };
  });

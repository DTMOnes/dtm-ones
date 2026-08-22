"use server";

import { revalidatePath } from "next/cache";

import { deleteBlobs } from "@/lib/blob";
import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import {
  clearPresentationImageSchema,
  commitPlayerImageSchema,
  removePlayerGalleryImageSchema,
} from "@/lib/validation/players";
import {
  addPlayerGalleryImage,
  clearPresentationImage,
  commitPresentationImage,
  removePlayerGalleryImage,
} from "@/utils/players";

export const commitPresentationImageAction = staffActionClient
  .metadata({ actionName: "commitPresentationImage" })
  .inputSchema(commitPlayerImageSchema)
  .action(async ({ parsedInput }) => {
    const player = await commitPresentationImage(
      db,
      parsedInput.playerId,
      { url: parsedInput.url, pathname: parsedInput.pathname },
      deleteBlobs,
    );

    revalidatePath("/clients");
    revalidatePath(`/players/${parsedInput.playerId}`);

    return { ok: true as const, player };
  });

export const clearPresentationImageAction = staffActionClient
  .metadata({ actionName: "clearPresentationImage" })
  .inputSchema(clearPresentationImageSchema)
  .action(async ({ parsedInput }) => {
    const player = await clearPresentationImage(
      db,
      parsedInput.playerId,
      deleteBlobs,
    );

    revalidatePath("/clients");
    revalidatePath(`/players/${parsedInput.playerId}`);

    return { ok: true as const, player };
  });

export const addPlayerGalleryImageAction = staffActionClient
  .metadata({ actionName: "addPlayerGalleryImage" })
  .inputSchema(commitPlayerImageSchema)
  .action(async ({ parsedInput }) => {
    const image = await addPlayerGalleryImage(
      db,
      parsedInput.playerId,
      { url: parsedInput.url, pathname: parsedInput.pathname },
      deleteBlobs,
    );

    revalidatePath(`/players/${parsedInput.playerId}`);

    return { ok: true as const, image };
  });

export const removePlayerGalleryImageAction = staffActionClient
  .metadata({ actionName: "removePlayerGalleryImage" })
  .inputSchema(removePlayerGalleryImageSchema)
  .action(async ({ parsedInput }) => {
    await removePlayerGalleryImage(
      db,
      parsedInput.playerId,
      parsedInput.imageId,
      deleteBlobs,
    );

    revalidatePath(`/players/${parsedInput.playerId}`);

    return { ok: true as const };
  });

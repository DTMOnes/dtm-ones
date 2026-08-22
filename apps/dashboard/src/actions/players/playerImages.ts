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
    const client = await commitPresentationImage(
      db,
      parsedInput.clientId,
      { url: parsedInput.url, pathname: parsedInput.pathname },
      deleteBlobs,
    );

    revalidatePath("/clients");
    revalidatePath(`/clients/${parsedInput.clientId}`);

    return { ok: true as const, client };
  });

export const clearPresentationImageAction = staffActionClient
  .metadata({ actionName: "clearPresentationImage" })
  .inputSchema(clearPresentationImageSchema)
  .action(async ({ parsedInput }) => {
    const client = await clearPresentationImage(
      db,
      parsedInput.clientId,
      deleteBlobs,
    );

    revalidatePath("/clients");
    revalidatePath(`/clients/${parsedInput.clientId}`);

    return { ok: true as const, client };
  });

export const addPlayerGalleryImageAction = staffActionClient
  .metadata({ actionName: "addPlayerGalleryImage" })
  .inputSchema(commitPlayerImageSchema)
  .action(async ({ parsedInput }) => {
    const image = await addPlayerGalleryImage(
      db,
      parsedInput.clientId,
      { url: parsedInput.url, pathname: parsedInput.pathname },
      deleteBlobs,
    );

    revalidatePath(`/clients/${parsedInput.clientId}`);

    return { ok: true as const, image };
  });

export const removePlayerGalleryImageAction = staffActionClient
  .metadata({ actionName: "removePlayerGalleryImage" })
  .inputSchema(removePlayerGalleryImageSchema)
  .action(async ({ parsedInput }) => {
    await removePlayerGalleryImage(
      db,
      parsedInput.clientId,
      parsedInput.imageId,
      deleteBlobs,
    );

    revalidatePath(`/clients/${parsedInput.clientId}`);

    return { ok: true as const };
  });

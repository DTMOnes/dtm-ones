"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import {
  addPlayerVideoSchema,
  removePlayerVideoSchema,
  updatePlayerVideoSchema,
} from "@/lib/validation/players";
import {
  addPlayerVideo,
  removePlayerVideo,
  updatePlayerVideo,
} from "@/utils/players";

export const addPlayerVideoAction = staffActionClient
  .metadata({ actionName: "addPlayerVideo" })
  .inputSchema(addPlayerVideoSchema)
  .action(async ({ parsedInput }) => {
    const video = await addPlayerVideo(
      db,
      parsedInput.playerId,
      parsedInput.youtubeUrl,
      parsedInput.title,
    );

    revalidatePath(`/clients/${parsedInput.playerId}`);

    return { ok: true as const, video };
  });

export const updatePlayerVideoAction = staffActionClient
  .metadata({ actionName: "updatePlayerVideo" })
  .inputSchema(updatePlayerVideoSchema)
  .action(async ({ parsedInput }) => {
    await updatePlayerVideo(
      db,
      parsedInput.playerId,
      parsedInput.videoId,
      parsedInput.youtubeUrl,
      parsedInput.title,
    );

    revalidatePath(`/clients/${parsedInput.playerId}`);

    return { ok: true as const };
  });

export const removePlayerVideoAction = staffActionClient
  .metadata({ actionName: "removePlayerVideo" })
  .inputSchema(removePlayerVideoSchema)
  .action(async ({ parsedInput }) => {
    await removePlayerVideo(db, parsedInput.playerId, parsedInput.videoId);

    revalidatePath(`/clients/${parsedInput.playerId}`);

    return { ok: true as const };
  });

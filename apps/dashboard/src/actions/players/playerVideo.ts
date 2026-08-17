"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import {
  addPlayerVideoSchema,
  removePlayerVideoSchema,
} from "@/lib/validation/players";
import { addPlayerVideo, removePlayerVideo } from "@/utils/players";

export const addPlayerVideoAction = staffActionClient
  .metadata({ actionName: "addPlayerVideo" })
  .inputSchema(addPlayerVideoSchema)
  .action(async ({ parsedInput }) => {
    const video = await addPlayerVideo(
      db,
      parsedInput.playerId,
      parsedInput.youtubeUrl,
    );

    revalidatePath(`/players/${parsedInput.playerId}`);

    return { ok: true as const, video };
  });

export const removePlayerVideoAction = staffActionClient
  .metadata({ actionName: "removePlayerVideo" })
  .inputSchema(removePlayerVideoSchema)
  .action(async ({ parsedInput }) => {
    await removePlayerVideo(db, parsedInput.playerId, parsedInput.videoId);

    revalidatePath(`/players/${parsedInput.playerId}`);

    return { ok: true as const };
  });

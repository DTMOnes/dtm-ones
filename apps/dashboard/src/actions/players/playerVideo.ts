"use server";

import { revalidatePath } from "next/cache";

import {
  NOT_FOUND,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import { assertActivePlayer } from "@/lib/players/assert-active-player";
import { requireStaff } from "@/lib/require-staff";
import { addPlayerVideoSchema } from "@/lib/validation/player-media";
import { videoIdSchema } from "@/lib/validation/players";
import type { PlayerVideo } from "@/types/player";
import { z } from "zod";

const videoRowSchema = z.object({
  id: z.uuid(),
  player_id: z.uuid(),
  youtube_url: z.string().min(1),
  sort_order: z.number().int(),
  created_at: z.string().min(1),
});

async function nextVideoSortOrder(
  playerId: string,
  actionName: string,
): Promise<ActionResult<{ sortOrder: number }>> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("player_videos")
    .select("sort_order")
    .eq("player_id", playerId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (error) {
    console.error(`[${actionName}/sort]`, error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const first = Array.isArray(data) && data.length > 0 ? data[0] : null;
  const current =
    first &&
    typeof first === "object" &&
    "sort_order" in first &&
    typeof first.sort_order === "number"
      ? first.sort_order
      : -1;

  return { data: { sortOrder: current + 1 }, error: null };
}

export async function addPlayerVideoAction(input: {
  playerId: string;
  youtube_url: string;
}): Promise<ActionResult<{ video: PlayerVideo }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = addPlayerVideoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message:
          parsed.error.issues[0]?.message ??
          "The video could not be validated. Please try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const playerGate = await assertActivePlayer(
    parsed.data.playerId,
    "addPlayerVideo",
  );
  if (playerGate.error) {
    return playerGate;
  }

  const sortResult = await nextVideoSortOrder(
    parsed.data.playerId,
    "addPlayerVideo",
  );
  if (sortResult.error) {
    return sortResult;
  }

  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("player_videos")
    .insert([
      {
        player_id: parsed.data.playerId,
        youtube_url: parsed.data.youtube_url,
        sort_order: sortResult.data.sortOrder,
      },
    ])
    .select("id, player_id, youtube_url, sort_order, created_at");

  if (error) {
    console.error("[addPlayerVideo]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const row = Array.isArray(data)
    ? data.map((item) => videoRowSchema.safeParse(item)).find((item) => item.success)
        ?.data
    : null;

  if (!row) {
    console.error("[addPlayerVideo]", "insert returned no video row");
    return { data: null, error: { message: UNAVAILABLE } };
  }

  revalidatePath(`/players/${parsed.data.playerId}`);
  return { data: { video: row }, error: null };
}

export async function deletePlayerVideoAction(input: {
  videoId: string;
  playerId: string;
}): Promise<ActionResult<null>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = videoIdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message: "The video could not be validated. Please try again.",
      },
    };
  }

  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("player_videos")
    .delete()
    .eq("id", parsed.data.videoId)
    .eq("player_id", parsed.data.playerId)
    .select("id");

  if (error) {
    console.error("[deletePlayerVideo]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (!Array.isArray(data) || data.length === 0) {
    return { data: null, error: { message: NOT_FOUND } };
  }

  revalidatePath(`/players/${parsed.data.playerId}`);
  return { data: null, error: null };
}

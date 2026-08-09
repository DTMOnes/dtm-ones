"use server";

import { revalidatePath } from "next/cache";

import {
  NOT_FOUND,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import { PLAYER_COLUMNS } from "@/lib/players/columns";
import { requireStaff } from "@/lib/require-staff";
import {
  parsePlayer,
  updatePlayerStatusSchema,
} from "@/lib/validation/players";
import type { Player } from "@/types/player";

export async function updatePlayerStatusAction(input: {
  id: string;
  status: string;
}): Promise<ActionResult<{ player: Player }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = updatePlayerStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message:
          parsed.error.issues[0]?.message ??
          "The player status could not be validated. Please try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const insforge = await createInsforgeServer();

  const { data, error } = await insforge.database
    .from("players")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .is("deleted_at", null)
    .select(PLAYER_COLUMNS);

  if (error) {
    console.error("[updatePlayerStatus]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const row = Array.isArray(data)
    ? data.map((item) => parsePlayer(item)).find((item) => item !== null)
    : null;

  if (!row) {
    return { data: null, error: { message: NOT_FOUND } };
  }

  revalidatePath("/players");
  revalidatePath(`/players/${row.id}`);
  return { data: { player: row }, error: null };
}

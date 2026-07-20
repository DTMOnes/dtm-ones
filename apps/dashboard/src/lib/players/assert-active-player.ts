import {
  NOT_FOUND,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function assertActivePlayer(
  playerId: string,
  actionName: string,
): Promise<ActionResult<{ id: string }>> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("players")
    .select("id")
    .eq("id", playerId)
    .is("deleted_at", null)
    .limit(1);

  if (error) {
    console.error(`[${actionName}]`, error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (!Array.isArray(data) || data.length === 0) {
    return { data: null, error: { message: NOT_FOUND } };
  }

  return { data: { id: playerId }, error: null };
}

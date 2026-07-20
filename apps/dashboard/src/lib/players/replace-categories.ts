import {
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import type { createInsforgeServer } from "@/lib/insforge-server";

type InsforgeServer = Awaited<ReturnType<typeof createInsforgeServer>>;

export async function replacePlayerCategories(
  insforge: InsforgeServer,
  playerId: string,
  categoryIds: string[],
  actionName: string,
): Promise<ActionResult<null>> {
  const { error: deleteError } = await insforge.database
    .from("player_categories")
    .delete()
    .eq("player_id", playerId);

  if (deleteError) {
    console.error(`[${actionName}/categories/delete]`, deleteError);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (categoryIds.length === 0) {
    return { data: null, error: null };
  }

  const { error: insertError } = await insforge.database
    .from("player_categories")
    .insert(
      categoryIds.map((categoryId) => ({
        player_id: playerId,
        category_id: categoryId,
      })),
    );

  if (insertError) {
    console.error(`[${actionName}/categories/insert]`, insertError);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  return { data: null, error: null };
}

import {
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import type { createInsforgeServer } from "@/lib/insforge-server";

type InsforgeServer = Awaited<ReturnType<typeof createInsforgeServer>>;

export const CATEGORY_NAME_TAKEN =
  "A category with this name already exists.";

export async function assertCategoryNameAvailable(
  insforge: InsforgeServer,
  name: string,
  excludeId: string | null,
  actionName: string,
): Promise<ActionResult<null>> {
  let query = insforge.database
    .from("categories")
    .select("id")
    .ilike("name", name);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    console.error(`[${actionName}]`, error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (data && data.length > 0) {
    return {
      data: null,
      error: {
        message: CATEGORY_NAME_TAKEN,
        fieldErrors: { name: [CATEGORY_NAME_TAKEN] },
      },
    };
  }

  return { data: null, error: null };
}

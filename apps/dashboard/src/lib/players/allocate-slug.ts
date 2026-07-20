import {
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { slugifyPlayerName } from "@/lib/players/slug";
import type { createInsforgeServer } from "@/lib/insforge-server";

type InsforgeServer = Awaited<ReturnType<typeof createInsforgeServer>>;

export async function allocateUniquePlayerSlug(
  insforge: InsforgeServer,
  fullName: string,
  excludeId: string | null,
  actionName: string,
): Promise<ActionResult<{ slug: string }>> {
  const base = slugifyPlayerName(fullName);
  let candidate = base;
  let suffix = 2;

  while (suffix < 1000) {
    let query = insforge.database
      .from("players")
      .select("id")
      .eq("slug", candidate);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      console.error(`[${actionName}]`, error);
      return { data: null, error: { message: UNAVAILABLE } };
    }

    if (!data || data.length === 0) {
      return { data: { slug: candidate }, error: null };
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  console.error(`[${actionName}]`, "slug allocation exhausted");
  return { data: null, error: { message: UNAVAILABLE } };
}

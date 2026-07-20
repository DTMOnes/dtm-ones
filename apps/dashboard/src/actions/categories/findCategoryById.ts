import {
  NOT_FOUND,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import { parseCategory } from "@/lib/validation/categories";
import type { Category } from "@/types/category";

const CATEGORY_COLUMNS = "id, name, slug, created_at, updated_at";

export async function findCategoryById(
  id: string,
  actionName: string,
): Promise<ActionResult<Category>> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`[${actionName}]`, error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (data === null) {
    return { data: null, error: { message: NOT_FOUND } };
  }

  const row = parseCategory(data);
  if (!row) {
    console.error(`[${actionName}]`, "invalid categories row shape");
    return { data: null, error: { message: UNAVAILABLE } };
  }

  return { data: row, error: null };
}

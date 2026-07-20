import { createInsforgeServer } from "@/lib/insforge-server";
import {
  parseCategoriesWithCount,
  parseCategoryDetail,
} from "@/lib/validation/categories";
import type { CategoryDetail, CategoryWithCount } from "@/types/category";

const CATEGORY_COLUMNS = "id, name, slug, created_at, updated_at";

export async function listCategories(q?: string): Promise<CategoryWithCount[]> {
  const insforge = await createInsforgeServer();
  let query = insforge.database
    .from("categories")
    .select(`${CATEGORY_COLUMNS}, player_categories(count)`)
    .order("name", { ascending: true });

  const trimmed = q?.trim() ?? "";
  if (trimmed.length > 0) {
    query = query.ilike("name", `%${trimmed}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[categories/queries/list]", error);
    throw new Error("Failed to load categories");
  }

  return parseCategoriesWithCount(data ?? []);
}

export async function getCategoryById(
  id: string,
): Promise<CategoryDetail | null> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("categories")
    .select(
      `${CATEGORY_COLUMNS}, player_categories(players(id, full_name))`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[categories/queries/getById]", error);
    throw new Error("Failed to load category");
  }

  if (data === null) {
    return null;
  }

  return parseCategoryDetail(data);
}

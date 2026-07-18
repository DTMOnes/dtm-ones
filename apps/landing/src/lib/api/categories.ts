// Types
import type { CategoryWithCount } from "@/types/category";

// API
import { apiFetch } from "@/lib/api/client";

export function getCategories(): Promise<CategoryWithCount[]> {
  return apiFetch<CategoryWithCount[]>("/categories");
}

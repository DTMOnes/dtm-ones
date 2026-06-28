import { apiFetch } from "@/lib/api/client";
import type { ApiCategory, ApiCategoryDetail, ApiCategoryWithCount, ApiMessageResponse } from "@/lib/api/types";
import type {
  createCategorySchema,
  updateCategorySchema,
} from "@/lib/validation/categories";
import type { z } from "zod";

type CreateCategoryInput = z.infer<typeof createCategorySchema>;
type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export async function getCategories(q?: string) {
  const query = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  return apiFetch<ApiCategoryWithCount[]>(`/categories${query}`);
}

export async function getCategoryById(categoryId: string) {
  return apiFetch<ApiCategoryDetail>(`/categories/${categoryId}`);
}

export async function createCategory(payload: CreateCategoryInput) {
  return apiFetch<ApiCategory>("/categories", {
    method: "POST",
    body: payload,
  });
}

export async function updateCategory(payload: UpdateCategoryInput) {
  return apiFetch<ApiCategory>(`/categories/${payload.id}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteCategory(categoryId: string) {
  return apiFetch<ApiMessageResponse>(`/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export async function removePlayerFromCategory(payload: {
  categoryId: string;
  playerId: string;
}) {
  return apiFetch<ApiMessageResponse>(
    `/categories/${payload.categoryId}/players/${payload.playerId}`,
    {
      method: "DELETE",
    },
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  removePlayerFromCategory,
  updateCategory,
} from "@/lib/api/categories";
import { queryKeys } from "@/lib/api/query-keys";
import type { ApiCategoryDetail } from "@/lib/api/types";
import type { z } from "zod";

import type {
  createCategorySchema,
  updateCategorySchema,
} from "@/lib/validation/categories";

type CreateCategoryInput = z.infer<typeof createCategorySchema>;
type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export function useCategoriesQuery(q: string) {
  return useQuery({
    queryKey: queryKeys.categories.list(q),
    queryFn: () => getCategories(q),
  });
}

export function useCategoryQuery(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(categoryId),
    queryFn: () => getCategoryById(categoryId),
    enabled: Boolean(categoryId),
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryInput) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCategoryInput) => updateCategory(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<ApiCategoryDetail | undefined>(
        queryKeys.categories.detail(updated.id),
        (current) => (current ? { ...current, ...updated } : current),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: (_data, categoryId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.categories.detail(categoryId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all });
    },
  });
}

export function useRemovePlayerFromCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removePlayerFromCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.detail(variables.categoryId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all });
    },
  });
}

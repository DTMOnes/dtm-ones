import { z } from "zod";

import type {
  Category,
  CategoryDetail,
  CategoryPlayerSummary,
  CategoryWithCount,
} from "@/types/category";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "Máximo 100 caracteres."),
});

export const updateCategorySchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .trim()
    .min(1, "The name is required.")
    .max(100, "Maximum 100 characters."),
});

export const deleteCategorySchema = z.object({
  id: z.uuid(),
});

export const removePlayerFromCategorySchema = z.object({
  categoryId: z.uuid(),
  playerId: z.uuid(),
});

export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

const categoryPlayerSummarySchema = z.object({
  id: z.uuid(),
  full_name: z.string().min(1),
  last_club: z.string(),
});

export function parseCategory(value: unknown): Category | null {
  const parsed = categorySchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

function readPlayerCount(value: unknown): number {
  if (!Array.isArray(value) || value.length === 0) {
    return 0;
  }

  const first = value[0];
  if (
    typeof first === "object" &&
    first !== null &&
    "count" in first &&
    typeof first.count === "number"
  ) {
    return first.count;
  }

  return 0;
}

export function parseCategoryWithCount(value: unknown): CategoryWithCount | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const row = value as Record<string, unknown>;
  const category = parseCategory({
    id: row.id,
    name: row.name,
    slug: row.slug,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });
  if (!category) {
    return null;
  }

  return {
    ...category,
    player_count: readPlayerCount(row.player_categories),
  };
}

export function parseCategoriesWithCount(value: unknown): CategoryWithCount[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const rows: CategoryWithCount[] = [];
  for (const item of value) {
    const row = parseCategoryWithCount(item);
    if (row) {
      rows.push(row);
    }
  }
  return rows;
}

function parseCategoryPlayerSummary(value: unknown): CategoryPlayerSummary | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const row = value as Record<string, unknown>;
  const parsed = categoryPlayerSummarySchema.safeParse({
    id: row.id,
    full_name: row.full_name,
    last_club: typeof row.last_club === "string" ? row.last_club : "",
  });
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

export function parseCategoryDetail(value: unknown): CategoryDetail | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const row = value as Record<string, unknown>;
  const category = parseCategory({
    id: row.id,
    name: row.name,
    slug: row.slug,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });
  if (!category) {
    return null;
  }

  const players: CategoryPlayerSummary[] = [];
  if (Array.isArray(row.player_categories)) {
    for (const junction of row.player_categories) {
      if (typeof junction !== "object" || junction === null) {
        continue;
      }
      const player = parseCategoryPlayerSummary(
        (junction as Record<string, unknown>).players,
      );
      if (player) {
        players.push(player);
      }
    }
  }

  return { ...category, players };
}

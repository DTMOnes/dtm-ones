import { cache } from "react";

import { createInsforgeServer } from "@/lib/insforge-server";
import type {
  PublicRosterCategory,
  PublicRosterCategoryRef,
  PublicRosterGalleryImage,
  PublicRosterPlayer,
  PublicRosterVideo,
} from "@/types/roster";

export type ListPublicRosterPlayersParams = {
  q?: string;
  categoryIds?: string[];
};

function readPlayerId(row: unknown): string | null {
  if (typeof row !== "object" || row === null || !("player_id" in row)) {
    return null;
  }

  const playerId = (row as { player_id: unknown }).player_id;
  return typeof playerId === "string" ? playerId : null;
}

function parseCategoryRefs(value: unknown): PublicRosterCategoryRef[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const refs: PublicRosterCategoryRef[] = [];

  for (const junction of value) {
    if (typeof junction !== "object" || junction === null) {
      continue;
    }

    const categories = (junction as { categories?: unknown }).categories;
    if (typeof categories !== "object" || categories === null) {
      continue;
    }

    const row = categories as Record<string, unknown>;
    if (
      typeof row.id !== "string" ||
      typeof row.name !== "string" ||
      typeof row.slug !== "string"
    ) {
      continue;
    }

    refs.push({ id: row.id, name: row.name, slug: row.slug });
  }

  return refs;
}

function parseGalleryImages(value: unknown): PublicRosterGalleryImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const images: PublicRosterGalleryImage[] = [];

  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    const row = item as Record<string, unknown>;
    if (
      typeof row.id !== "string" ||
      typeof row.url !== "string" ||
      typeof row.sort_order !== "number"
    ) {
      continue;
    }

    images.push({ id: row.id, url: row.url, sort_order: row.sort_order });
  }

  return images.sort((a, b) => a.sort_order - b.sort_order);
}

function parseVideos(value: unknown): PublicRosterVideo[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const videos: PublicRosterVideo[] = [];

  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    const row = item as Record<string, unknown>;
    if (
      typeof row.id !== "string" ||
      typeof row.youtube_url !== "string" ||
      typeof row.sort_order !== "number"
    ) {
      continue;
    }

    videos.push({
      id: row.id,
      youtube_url: row.youtube_url,
      sort_order: row.sort_order,
    });
  }

  return videos.sort((a, b) => a.sort_order - b.sort_order);
}

function parseRosterPlayer(value: unknown): PublicRosterPlayer | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.slug !== "string" ||
    typeof row.full_name !== "string" ||
    typeof row.nationality !== "string" ||
    typeof row.height_cm !== "number"
  ) {
    return null;
  }

  const presentationImageUrl =
    row.presentation_image_url === null ||
    typeof row.presentation_image_url === "string"
      ? row.presentation_image_url
      : null;

  const lastClub = typeof row.last_club === "string" ? row.last_club : "";

  const categories = parseCategoryRefs(row.player_categories);
  if (categories.length === 0) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    full_name: row.full_name,
    nationality: row.nationality,
    height_cm: row.height_cm,
    last_club: lastClub,
    presentation_image_url: presentationImageUrl,
    categories,
    gallery_images: parseGalleryImages(row.player_gallery_images),
    videos: parseVideos(row.player_videos),
  };
}

async function playerIdsMatchingAllCategories(
  categoryIds: string[],
): Promise<string[]> {
  const insforge = createInsforgeServer();
  let intersection: Set<string> | null = null;

  for (const categoryId of categoryIds) {
    const { data: junctions, error } = await insforge.database
      .from("player_categories")
      .select("player_id")
      .eq("category_id", categoryId);

    if (error) {
      console.error("[roster/queries/players/categories]", error);
      throw new Error("Failed to load roster");
    }

    const ids = new Set<string>();
    for (const row of junctions ?? []) {
      const playerId = readPlayerId(row);
      if (playerId !== null) {
        ids.add(playerId);
      }
    }

    if (intersection === null) {
      intersection = ids;
    } else {
      const next = new Set<string>();
      for (const playerId of intersection) {
        if (ids.has(playerId)) {
          next.add(playerId);
        }
      }
      intersection = next;
    }

    if (intersection.size === 0) {
      return [];
    }
  }

  return intersection === null ? [] : [...intersection];
}

/**
 * Single public roster player by id: published, not soft deleted, at least one category.
 * Cached per request so layout + page can share one fetch.
 */
export const getPublicRosterPlayer = cache(
  async (id: string): Promise<PublicRosterPlayer | null> => {
    const insforge = createInsforgeServer();

    const { data, error } = await insforge.database
      .from("players")
      .select(
        `
      id,
      slug,
      full_name,
      nationality,
      height_cm,
      last_club,
      presentation_image_url,
      player_categories!inner(categories(id, name, slug)),
      player_gallery_images(id, url, sort_order),
      player_videos(id, youtube_url, sort_order)
      `,
      )
      .eq("id", id)
      .eq("status", "published")
      .is("deleted_at", null)
      .limit(1);

    if (error) {
      console.error("[roster/queries/players/by-id]", error);
      throw new Error("Failed to load player");
    }

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    return parseRosterPlayer(data[0]);
  },
);

/**
 * Public roster players: published, not soft deleted, at least one category.
 * Multi category filter uses AND (intersect player id sets per selected `c`).
 */
export async function listPublicRosterPlayers(
  params: ListPublicRosterPlayersParams = {},
): Promise<PublicRosterPlayer[]> {
  const insforge = createInsforgeServer();
  const categoryIds = params.categoryIds ?? [];

  let playerIds: string[] | null = null;
  if (categoryIds.length > 0) {
    playerIds = await playerIdsMatchingAllCategories(categoryIds);
    if (playerIds.length === 0) {
      return [];
    }
  }

  let query = insforge.database
    .from("players")
    .select(
      `
      id,
      slug,
      full_name,
      nationality,
      height_cm,
      last_club,
      presentation_image_url,
      player_categories!inner(categories(id, name, slug)),
      player_gallery_images(id, url, sort_order),
      player_videos(id, youtube_url, sort_order)
      `,
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  const trimmed = params.q?.trim() ?? "";
  if (trimmed.length > 0) {
    query = query.ilike("full_name", `%${trimmed}%`);
  }

  if (playerIds !== null) {
    query = query.in("id", playerIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[roster/queries/players]", error);
    throw new Error("Failed to load roster");
  }

  if (!Array.isArray(data)) {
    return [];
  }

  const players: PublicRosterPlayer[] = [];
  for (const row of data) {
    const player = parseRosterPlayer(row);
    if (player !== null) {
      players.push(player);
    }
  }

  return players;
}

/**
 * All categories with counts of eligible public roster players only.
 * Counts do not change with the active name or AND filter.
 * Cached per request so root layout + home page share one fetch.
 */
export const listPublicRosterCategories = cache(async (): Promise<
  PublicRosterCategory[]
> => {
  const insforge = createInsforgeServer();

  const { data: categories, error: categoriesError } = await insforge.database
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (categoriesError) {
    console.error("[roster/queries/categories]", categoriesError);
    throw new Error("Failed to load roster categories");
  }

  const { data: eligiblePlayers, error: playersError } = await insforge.database
    .from("players")
    .select("id, player_categories!inner(category_id)")
    .eq("status", "published")
    .is("deleted_at", null);

  if (playersError) {
    console.error("[roster/queries/categories/counts]", playersError);
    throw new Error("Failed to load roster categories");
  }

  const counts = new Map<string, number>();

  if (Array.isArray(eligiblePlayers)) {
    for (const player of eligiblePlayers) {
      if (typeof player !== "object" || player === null) {
        continue;
      }

      const junctions = (player as { player_categories?: unknown })
        .player_categories;
      if (!Array.isArray(junctions)) {
        continue;
      }

      const seenForPlayer = new Set<string>();

      for (const junction of junctions) {
        if (
          typeof junction !== "object" ||
          junction === null ||
          !("category_id" in junction)
        ) {
          continue;
        }

        const categoryId = (junction as { category_id: unknown }).category_id;
        if (typeof categoryId !== "string" || seenForPlayer.has(categoryId)) {
          continue;
        }

        seenForPlayer.add(categoryId);
        counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
      }
    }
  }

  if (!Array.isArray(categories)) {
    return [];
  }

  const result: PublicRosterCategory[] = [];

  for (const row of categories) {
    if (typeof row !== "object" || row === null) {
      continue;
    }

    const category = row as Record<string, unknown>;
    if (
      typeof category.id !== "string" ||
      typeof category.name !== "string" ||
      typeof category.slug !== "string"
    ) {
      continue;
    }

    result.push({
      id: category.id,
      name: category.name,
      slug: category.slug,
      player_count: counts.get(category.id) ?? 0,
    });
  }

  return result;
});

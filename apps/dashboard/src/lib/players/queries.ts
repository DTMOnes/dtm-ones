import { createInsforgeServer } from "@/lib/insforge-server";
import { PLAYER_COLUMNS } from "@/lib/players/columns";
import {
  parsePlayerDetail,
  parsePlayerListItems,
} from "@/lib/validation/players";
import type { PlayerDetail, PlayerListItem } from "@/types/player";

const LIST_SELECT = `${PLAYER_COLUMNS}, player_categories(categories(id, name))`;

const DETAIL_SELECT = `${PLAYER_COLUMNS}, player_categories(categories(id, name)), player_gallery_images(id, player_id, url, sort_order, created_at), player_videos(id, player_id, youtube_url, sort_order, created_at)`;

export type ListPlayersParams = {
  q?: string;
  categoryIds?: string[];
};

/**
 * List active players for the dashboard.
 * Soft deleted rows (`deleted_at` set) are excluded.
 * `q` filters `full_name` with case insensitive `ilike`.
 * Category filter resolves matching `player_id`s from `player_categories`
 * first, then applies `.in("id", ...)`, so the categories embed still returns
 * the full badge set (not only the filtered junction rows).
 */
export async function listPlayers(
  params: ListPlayersParams = {},
): Promise<PlayerListItem[]> {
  const insforge = await createInsforgeServer();
  const categoryIds = params.categoryIds ?? [];

  let playerIds: string[] | null = null;
  if (categoryIds.length > 0) {
    const { data: junctions, error: junctionError } = await insforge.database
      .from("player_categories")
      .select("player_id")
      .in("category_id", categoryIds);

    if (junctionError) {
      console.error("[players/queries/list/categories]", junctionError);
      throw new Error("Failed to load players");
    }

    playerIds = [
      ...new Set(
        (junctions ?? [])
          .map((row) =>
            typeof row === "object" &&
            row !== null &&
            "player_id" in row &&
            typeof (row as { player_id: unknown }).player_id === "string"
              ? (row as { player_id: string }).player_id
              : null,
          )
          .filter((id): id is string => id !== null),
      ),
    ];

    if (playerIds.length === 0) {
      return [];
    }
  }

  let query = insforge.database
    .from("players")
    .select(LIST_SELECT)
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  const trimmed = params.q?.trim() ?? "";
  if (trimmed.length > 0) {
    query = query.ilike("full_name", `%${trimmed}%`);
  }

  if (playerIds) {
    query = query.in("id", playerIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[players/queries/list]", error);
    throw new Error("Failed to load players");
  }

  return parsePlayerListItems(data ?? []);
}

export async function getPlayerById(id: string): Promise<PlayerDetail | null> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("players")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("[players/queries/getById]", error);
    throw new Error("Failed to load player");
  }

  if (data === null) {
    return null;
  }

  return parsePlayerDetail(data);
}

import { cache } from "react";
import { connection } from "next/server";
import {
  getPublicRosterPlayer as getRosterPlayer,
  listPublicRosterCategories as listRosterCategories,
  listPublicRosterPlayers as listRosterPlayers,
  type ListPublicRosterPlayersParams,
  type RosterCategory,
  type RosterPlayer,
} from "@dtm/database";

import { db } from "@/lib/db";
import type {
  PublicRosterCategory,
  PublicRosterPlayer,
} from "@/types/roster";

export type { ListPublicRosterPlayersParams };

function toPublicPlayer(player: RosterPlayer): PublicRosterPlayer {
  return {
    id: player.id,
    slug: player.id,
    full_name: player.name,
    nationality: player.nationality,
    height_cm: player.heightCm ?? 0,
    last_club: player.lastClub,
    eurobasket_link: player.eurobasketLink,
    presentation_image_url: player.presentationImageUrl,
    categories:
      player.categoryId && player.categoryName
        ? [
            {
              id: player.categoryId,
              name: player.categoryName,
              slug: player.categoryId,
            },
          ]
        : [],
    gallery_images: player.gallery.map((image) => ({
      id: image.id,
      url: image.url,
      sort_order: image.sortOrder,
    })),
    videos: player.videos.map((video) => ({
      id: video.id,
      youtube_url: video.youtubeUrl,
      sort_order: video.sortOrder,
    })),
  };
}

function toPublicCategory(category: RosterCategory): PublicRosterCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.id,
    player_count: 0,
  };
}

export const getPublicRosterPlayer = cache(
  async (id: string): Promise<PublicRosterPlayer | null> => {
    await connection();
    const player = await getRosterPlayer(db, id);
    return player ? toPublicPlayer(player) : null;
  },
);

export async function listPublicRosterPlayers(
  params: ListPublicRosterPlayersParams = {},
): Promise<PublicRosterPlayer[]> {
  await connection();
  const players = await listRosterPlayers(db, params);
  return players.map(toPublicPlayer);
}

export const listPublicRosterCategories = cache(async (): Promise<
  PublicRosterCategory[]
> => {
  await connection();
  const categories = await listRosterCategories(db);
  return categories.map(toPublicCategory);
});

import { and, asc, eq, ilike, inArray, isNotNull } from "drizzle-orm";

import type { Database } from "./client";
import {
  roster,
  rosterGalleryImages,
  rosterVideos,
} from "./schema";

export type RosterPlayer = {
  id: string;
  kind: "player" | "coach";
  name: string;
  nationality: string;
  lastClub: string;
  eurobasketLink: string | null;
  heightCm: number | null;
  categoryId: string | null;
  categoryName: string | null;
  presentationImageUrl: string | null;
  gallery: { id: string; url: string; sortOrder: number }[];
  videos: { id: string; youtubeUrl: string; sortOrder: number }[];
};

export type RosterCategory = {
  id: string;
  name: string;
};

export type ListPublicRosterPlayersParams = {
  q?: string;
  categoryIds?: string[];
  kind?: "player" | "coach";
  limit?: number;
  offset?: number;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

const rosterColumns = {
  id: roster.id,
  kind: roster.kind,
  name: roster.name,
  nationality: roster.nationality,
  lastClub: roster.lastClub,
  eurobasketLink: roster.eurobasketLink,
  heightCm: roster.heightCm,
  categoryId: roster.categoryId,
  categoryName: roster.categoryName,
  presentationImageUrl: roster.presentationImageUrl,
} as const;

export async function listPublicRosterPlayers(
  db: Database,
  params: ListPublicRosterPlayersParams = {},
): Promise<RosterPlayer[]> {
  const filters = [];

  if (params.kind) {
    filters.push(eq(roster.kind, params.kind));
  }

  const trimmed = params.q?.trim() ?? "";
  if (trimmed.length > 0) {
    filters.push(ilike(roster.name, `%${trimmed}%`));
  }

  const categoryIds = (params.categoryIds ?? []).filter(isUuid);
  if (categoryIds.length > 0) {
    filters.push(inArray(roster.categoryId, categoryIds));
  }

  let query = db
    .select(rosterColumns)
    .from(roster)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(roster.name))
    .$dynamic();

  if (params.limit !== undefined) {
    query = query.limit(params.limit);
  }
  if (params.offset !== undefined) {
    query = query.offset(params.offset);
  }

  const rows = await query;

  return rows.map((row) => ({
    ...row,
    name: row.name ?? "",
    nationality: row.nationality ?? "",
    lastClub: row.lastClub ?? "",
    gallery: [],
    videos: [],
  }));
}

export async function getPublicRosterPlayer(
  db: Database,
  id: string,
): Promise<RosterPlayer | null> {
  if (!isUuid(id)) {
    return null;
  }

  const [row] = await db
    .select(rosterColumns)
    .from(roster)
    .where(eq(roster.id, id))
    .limit(1);

  if (!row) {
    return null;
  }

  const gallery = await db
    .select({
      id: rosterGalleryImages.id,
      url: rosterGalleryImages.url,
      sortOrder: rosterGalleryImages.sortOrder,
    })
    .from(rosterGalleryImages)
    .where(eq(rosterGalleryImages.clientId, id))
    .orderBy(asc(rosterGalleryImages.sortOrder));

  const videos = await db
    .select({
      id: rosterVideos.id,
      youtubeUrl: rosterVideos.youtubeUrl,
      sortOrder: rosterVideos.sortOrder,
    })
    .from(rosterVideos)
    .where(eq(rosterVideos.clientId, id))
    .orderBy(asc(rosterVideos.sortOrder));

  return {
    ...row,
    name: row.name ?? "",
    nationality: row.nationality ?? "",
    lastClub: row.lastClub ?? "",
    gallery,
    videos,
  };
}

export async function listPublicRosterCategories(
  db: Database,
): Promise<RosterCategory[]> {
  const rows = await db
    .select({
      id: roster.categoryId,
      name: roster.categoryName,
    })
    .from(roster)
    .where(and(eq(roster.kind, "player"), isNotNull(roster.categoryId)))
    .groupBy(roster.categoryId, roster.categoryName)
    .orderBy(asc(roster.categoryName));

  const categories: RosterCategory[] = [];
  for (const row of rows) {
    if (row.id && row.name) {
      categories.push({ id: row.id, name: row.name });
    }
  }
  return categories;
}

import { and, asc, eq, isNull } from "drizzle-orm";
import { schema, type Database } from "@dtm/database";

import type { PlayerDetail, PlayerVisibility } from "@/types/player";
import { ConflictError, NotFoundError } from "./errors";
import { isPlayerBlobPathname } from "./player-blob-path";

export type DeleteBlobs = (keys: string[]) => Promise<void>;

export type PlayerImageBlob = {
  url: string;
  pathname: string;
};

export type PlayerWrite = {
  name: string;
  nationality: string;
  lastClub: string;
  heightCm?: number | null;
  categoryId?: string | null;
  presentationImageUrl?: string | null;
  eurobasketLink?: string | null;
};

export type PlayerPatch = Partial<Omit<PlayerWrite, "presentationImageUrl">>;

export function playerCompletenessGaps(player: {
  name: string;
  nationality: string;
  lastClub: string;
  heightCm: number | null;
  categoryId: string | null;
  presentationImageUrl: string | null;
}): string[] {
  const gaps: string[] = [];

  if (!player.name.trim()) {
    gaps.push("Name");
  }
  if (!player.nationality.trim()) {
    gaps.push("Nationality");
  }
  if (!player.lastClub.trim()) {
    gaps.push("Last club");
  }
  if (player.heightCm == null) {
    gaps.push("Height");
  }
  if (!player.categoryId) {
    gaps.push("Category");
  }
  if (!player.presentationImageUrl) {
    gaps.push("Presentation image");
  }

  return gaps;
}

function isPlayerComplete(player: {
  name: string;
  nationality: string;
  lastClub: string;
  heightCm: number | null;
  categoryId: string | null;
  presentationImageUrl: string | null;
}): boolean {
  return playerCompletenessGaps(player).length === 0;
}

function postgresError(error: unknown): object | null {
  let current: unknown = error;
  while (typeof current === "object" && current !== null) {
    if ("code" in current && typeof current.code === "string") {
      return current;
    }
    current = "cause" in current ? current.cause : undefined;
  }
  return null;
}

function isForeignKeyViolation(error: unknown): boolean {
  const pgError = postgresError(error);
  return pgError !== null && "code" in pgError && pgError.code === "23503";
}

export async function getPlayer(
  db: Database,
  id: string,
): Promise<PlayerDetail | null> {
  const row = await db.query.clients.findFirst({
    columns: {
      id: true,
      name: true,
      nationality: true,
      lastClub: true,
      eurobasketLink: true,
      visibility: true,
      heightCm: true,
      categoryId: true,
      presentationImageUrl: true,
    },
    where: and(
      eq(schema.clients.id, id),
      eq(schema.clients.kind, "player"),
      isNull(schema.clients.trashedAt),
    ),
    with: {
      category: {
        columns: {
          name: true,
        },
      },
      galleryImages: {
        columns: {
          id: true,
          url: true,
        },
        orderBy: [
          asc(schema.playerGalleryImages.sortOrder),
          asc(schema.playerGalleryImages.createdAt),
        ],
      },
      videos: {
        columns: {
          id: true,
          youtubeUrl: true,
        },
        orderBy: [
          asc(schema.playerVideos.sortOrder),
          asc(schema.playerVideos.createdAt),
        ],
      },
    },
  });

  if (!row) {
    return null;
  }

  const { category, galleryImages, videos, ...player } = row;
  return {
    ...player,
    categoryName: category?.name ?? null,
    gallery: galleryImages,
    videos,
  };
}

export async function createPlayer(
  db: Database,
  input: PlayerWrite,
): Promise<PlayerDetail> {
  try {
    const [row] = await db
      .insert(schema.clients)
      .values({
        kind: "player",
        name: input.name,
        nationality: input.nationality,
        lastClub: input.lastClub,
        visibility: "private",
        heightCm: input.heightCm ?? null,
        categoryId: input.categoryId ?? null,
        presentationImageUrl: input.presentationImageUrl ?? null,
        eurobasketLink: input.eurobasketLink ?? null,
      })
      .returning({ id: schema.clients.id });

    if (!row) {
      throw new Error("createPlayer returned no row");
    }

    const player = await getPlayer(db, row.id);
    if (!player) {
      throw new Error("createPlayer could not load player");
    }

    return player;
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw new NotFoundError("Category");
    }

    throw error;
  }
}

export async function updatePlayer(
  db: Database,
  id: string,
  patch: PlayerPatch,
): Promise<PlayerDetail> {
  const existing = await getPlayer(db, id);
  if (!existing) {
    throw new NotFoundError("Player");
  }

  const next = {
    name: patch.name ?? existing.name,
    nationality: patch.nationality ?? existing.nationality,
    lastClub: patch.lastClub ?? existing.lastClub,
    heightCm: patch.heightCm === undefined ? existing.heightCm : patch.heightCm,
    categoryId:
      patch.categoryId === undefined ? existing.categoryId : patch.categoryId,
    presentationImageUrl: existing.presentationImageUrl,
    eurobasketLink:
      patch.eurobasketLink === undefined
        ? existing.eurobasketLink
        : patch.eurobasketLink,
  };

  if (existing.visibility === "public" && !isPlayerComplete(next)) {
    throw new ConflictError(
      "A Player cannot be public unless the profile is complete.",
    );
  }

  try {
    await db
      .update(schema.clients)
      .set({ ...next, updatedAt: new Date() })
      .where(eq(schema.clients.id, id));
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw new NotFoundError("Category");
    }

    throw error;
  }

  const player = await getPlayer(db, id);
  if (!player) {
    throw new NotFoundError("Player");
  }

  return player;
}

export async function setPlayerVisibility(
  db: Database,
  id: string,
  visibility: PlayerVisibility,
): Promise<PlayerDetail> {
  const existing = await getPlayer(db, id);
  if (!existing) {
    throw new NotFoundError("Player");
  }

  if (visibility === "public" && !isPlayerComplete(existing)) {
    throw new ConflictError(
      "A Player cannot be public unless the profile is complete.",
    );
  }

  await db
    .update(schema.clients)
    .set({ visibility, updatedAt: new Date() })
    .where(eq(schema.clients.id, id));

  const player = await getPlayer(db, id);
  if (!player) {
    throw new NotFoundError("Player");
  }

  return player;
}

export async function addPlayerVideo(
  db: Database,
  playerId: string,
  youtubeUrl: string,
): Promise<{ id: string; youtubeUrl: string }> {
  const existing = await getPlayer(db, playerId);
  if (!existing) {
    throw new NotFoundError("Player");
  }

  const [row] = await db
    .insert(schema.playerVideos)
    .values({
      clientId: playerId,
      clientKind: "player",
      youtubeUrl,
      sortOrder: existing.videos.length,
    })
    .returning({
      id: schema.playerVideos.id,
      youtubeUrl: schema.playerVideos.youtubeUrl,
    });

  if (!row) {
    throw new Error("addPlayerVideo returned no row");
  }

  return row;
}

export async function removePlayerVideo(
  db: Database,
  playerId: string,
  videoId: string,
): Promise<void> {
  const [row] = await db
    .delete(schema.playerVideos)
    .where(
      and(
        eq(schema.playerVideos.id, videoId),
        eq(schema.playerVideos.clientId, playerId),
      ),
    )
    .returning({ id: schema.playerVideos.id });

  if (!row) {
    throw new NotFoundError("Video");
  }
}

export async function commitPresentationImage(
  db: Database,
  playerId: string,
  blob: PlayerImageBlob,
  deleteBlobs: DeleteBlobs,
): Promise<PlayerDetail> {
  if (!isPlayerBlobPathname(playerId, "presentation", blob.pathname)) {
    await deleteBlobs([blob.pathname]);
    throw new ConflictError("Invalid image path.");
  }

  const existing = await db.query.clients.findFirst({
    columns: {
      id: true,
      presentationImageKey: true,
    },
    where: and(
      eq(schema.clients.id, playerId),
      eq(schema.clients.kind, "player"),
      isNull(schema.clients.trashedAt),
    ),
  });

  if (!existing) {
    await deleteBlobs([blob.pathname]);
    throw new NotFoundError("Player");
  }

  try {
    await db
      .update(schema.clients)
      .set({
        presentationImageUrl: blob.url,
        presentationImageKey: blob.pathname,
        updatedAt: new Date(),
      })
      .where(eq(schema.clients.id, playerId));
  } catch (error) {
    await deleteBlobs([blob.pathname]);
    throw error;
  }

  const previousKey = existing.presentationImageKey;
  if (previousKey && previousKey !== blob.pathname) {
    try {
      await deleteBlobs([previousKey]);
    } catch {
      // ponytail: old object may linger until Trash; the new URL is already stored.
    }
  }

  const player = await getPlayer(db, playerId);
  if (!player) {
    throw new NotFoundError("Player");
  }

  return player;
}

export async function clearPresentationImage(
  db: Database,
  playerId: string,
  deleteBlobs: DeleteBlobs,
): Promise<PlayerDetail> {
  const existing = await db.query.clients.findFirst({
    columns: {
      id: true,
      name: true,
      nationality: true,
      lastClub: true,
      visibility: true,
      heightCm: true,
      categoryId: true,
      presentationImageUrl: true,
      presentationImageKey: true,
    },
    where: and(
      eq(schema.clients.id, playerId),
      eq(schema.clients.kind, "player"),
      isNull(schema.clients.trashedAt),
    ),
  });

  if (!existing) {
    throw new NotFoundError("Player");
  }

  const next = {
    ...existing,
    presentationImageUrl: null,
  };

  if (existing.visibility === "public" && !isPlayerComplete(next)) {
    throw new ConflictError(
      "A Player cannot be public unless the profile is complete.",
    );
  }

  await db
    .update(schema.clients)
    .set({
      presentationImageUrl: null,
      presentationImageKey: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.clients.id, playerId));

  if (existing.presentationImageKey) {
    await deleteBlobs([existing.presentationImageKey]);
  }

  const player = await getPlayer(db, playerId);
  if (!player) {
    throw new NotFoundError("Player");
  }

  return player;
}

export async function addPlayerGalleryImage(
  db: Database,
  playerId: string,
  blob: PlayerImageBlob,
  deleteBlobs: DeleteBlobs,
): Promise<{ id: string; url: string }> {
  if (!isPlayerBlobPathname(playerId, "gallery", blob.pathname)) {
    await deleteBlobs([blob.pathname]);
    throw new ConflictError("Invalid image path.");
  }

  const existing = await getPlayer(db, playerId);
  if (!existing) {
    await deleteBlobs([blob.pathname]);
    throw new NotFoundError("Player");
  }

  try {
    const [row] = await db
      .insert(schema.playerGalleryImages)
      .values({
        clientId: playerId,
        clientKind: "player",
        url: blob.url,
        storageKey: blob.pathname,
        sortOrder: existing.gallery.length,
      })
      .returning({
        id: schema.playerGalleryImages.id,
        url: schema.playerGalleryImages.url,
      });

    if (!row) {
      throw new Error("addPlayerGalleryImage returned no row");
    }

    return row;
  } catch (error) {
    await deleteBlobs([blob.pathname]);
    throw error;
  }
}

export async function removePlayerGalleryImage(
  db: Database,
  playerId: string,
  imageId: string,
  deleteBlobs: DeleteBlobs,
): Promise<void> {
  const image = await db.query.playerGalleryImages.findFirst({
    columns: {
      id: true,
      storageKey: true,
    },
    where: and(
      eq(schema.playerGalleryImages.id, imageId),
      eq(schema.playerGalleryImages.clientId, playerId),
    ),
  });

  if (!image) {
    throw new NotFoundError("Image");
  }

  await db
    .delete(schema.playerGalleryImages)
    .where(eq(schema.playerGalleryImages.id, imageId));

  if (image.storageKey) {
    await deleteBlobs([image.storageKey]);
  }
}

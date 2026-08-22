import { and, asc, eq, isNull } from "drizzle-orm";
import { schema, type Database } from "@dtm/database";

import type { Coach } from "@/types/coach";
import type { PlayerDetail, PlayerVisibility } from "@/types/player";
import { getCoach, isCoachComplete } from "./coaches";
import { ConflictError, NotFoundError } from "./errors";
import {
  isClientBlobPathname,
  type ClientBlobKind,
} from "./player-blob-path";

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

export type PlayerCompletenessCheck = {
  label: string;
  met: boolean;
};

type PlayerCompletenessInput = {
  name: string | null;
  nationality: string | null;
  lastClub: string | null;
  heightCm: number | null;
  categoryId: string | null;
  presentationImageUrl: string | null;
  eurobasketLink: string | null;
  gallery: { length: number };
  videos: { length: number };
};

export function playerCompletenessChecks(
  player: PlayerCompletenessInput,
): PlayerCompletenessCheck[] {
  return [
    { label: "Name", met: Boolean(player.name?.trim()) },
    { label: "Nationality", met: Boolean(player.nationality?.trim()) },
    { label: "Last club", met: Boolean(player.lastClub?.trim()) },
    { label: "Height", met: player.heightCm != null },
    { label: "Category", met: Boolean(player.categoryId) },
    {
      label: "Presentation image",
      met: Boolean(player.presentationImageUrl),
    },
    { label: "Eurobasket link", met: Boolean(player.eurobasketLink?.trim()) },
    { label: "Gallery image", met: player.gallery.length > 0 },
    { label: "Video", met: player.videos.length > 0 },
  ];
}

export function playerCompletenessGaps(
  player: PlayerCompletenessInput,
): string[] {
  return playerCompletenessChecks(player)
    .filter((check) => !check.met)
    .map((check) => check.label);
}

function isPlayerComplete(player: PlayerCompletenessInput): boolean {
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
    gallery: existing.gallery,
    videos: existing.videos,
  };

  if (existing.visibility === "public" && !isPlayerComplete(next)) {
    throw new ConflictError(
      "A Player cannot be public unless the profile is complete.",
    );
  }

  try {
    await db
      .update(schema.clients)
      .set({
        name: next.name,
        nationality: next.nationality,
        lastClub: next.lastClub,
        heightCm: next.heightCm,
        categoryId: next.categoryId,
        presentationImageUrl: next.presentationImageUrl,
        eurobasketLink: next.eurobasketLink,
        updatedAt: new Date(),
      })
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
  const existing = await getPlayer(db, playerId);
  const nextVideos = existing?.videos.filter((video) => video.id !== videoId);
  if (
    existing?.visibility === "public" &&
    nextVideos &&
    !isPlayerComplete({ ...existing, videos: nextVideos })
  ) {
    throw new ConflictError(
      "A Player cannot be public unless the profile is complete.",
    );
  }

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

function imageBlobKind(
  clientId: string,
  slot: "presentation" | "gallery",
  pathname: string,
): ClientBlobKind | null {
  if (isClientBlobPathname("player", clientId, slot, pathname)) {
    return "player";
  }
  if (isClientBlobPathname("coach", clientId, slot, pathname)) {
    return "coach";
  }
  return null;
}

export async function commitPresentationImage(
  db: Database,
  clientId: string,
  blob: PlayerImageBlob,
  deleteBlobs: DeleteBlobs,
): Promise<PlayerDetail | Coach> {
  const kind = imageBlobKind(clientId, "presentation", blob.pathname);
  if (!kind) {
    await deleteBlobs([blob.pathname]);
    throw new ConflictError("Invalid image path.");
  }

  const existing = await db.query.clients.findFirst({
    columns: {
      id: true,
      presentationImageKey: true,
    },
    where: and(
      eq(schema.clients.id, clientId),
      eq(schema.clients.kind, kind),
      isNull(schema.clients.trashedAt),
    ),
  });

  if (!existing) {
    await deleteBlobs([blob.pathname]);
    throw new NotFoundError(kind === "player" ? "Player" : "Coach");
  }

  try {
    await db
      .update(schema.clients)
      .set({
        presentationImageUrl: blob.url,
        presentationImageKey: blob.pathname,
        updatedAt: new Date(),
      })
      .where(eq(schema.clients.id, clientId));
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

  if (kind === "player") {
    const player = await getPlayer(db, clientId);
    if (!player) {
      throw new NotFoundError("Player");
    }

    return player;
  }

  const coach = await getCoach(db, clientId);
  if (!coach) {
    throw new NotFoundError("Coach");
  }

  return coach;
}

export async function clearPresentationImage(
  db: Database,
  clientId: string,
  deleteBlobs: DeleteBlobs,
): Promise<PlayerDetail | Coach> {
  const existing = await db.query.clients.findFirst({
    columns: {
      id: true,
      kind: true,
      presentationImageKey: true,
    },
    where: and(
      eq(schema.clients.id, clientId),
      isNull(schema.clients.trashedAt),
    ),
  });

  if (!existing) {
    throw new NotFoundError("Client");
  }

  if (existing.kind === "player") {
    const player = await getPlayer(db, clientId);
    if (!player) {
      throw new NotFoundError("Player");
    }

    if (
      player.visibility === "public" &&
      !isPlayerComplete({ ...player, presentationImageUrl: null })
    ) {
      throw new ConflictError(
        "A Player cannot be public unless the profile is complete.",
      );
    }
  } else {
    const coach = await getCoach(db, clientId);
    if (!coach) {
      throw new NotFoundError("Coach");
    }

    if (
      coach.visibility === "public" &&
      !isCoachComplete({ ...coach, presentationImageUrl: null })
    ) {
      throw new ConflictError(
        "A Coach cannot be public unless the profile is complete.",
      );
    }
  }

  await db
    .update(schema.clients)
    .set({
      presentationImageUrl: null,
      presentationImageKey: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.clients.id, clientId));

  if (existing.presentationImageKey) {
    await deleteBlobs([existing.presentationImageKey]);
  }

  if (existing.kind === "player") {
    const player = await getPlayer(db, clientId);
    if (!player) {
      throw new NotFoundError("Player");
    }

    return player;
  }

  const coach = await getCoach(db, clientId);
  if (!coach) {
    throw new NotFoundError("Coach");
  }

  return coach;
}

export async function addPlayerGalleryImage(
  db: Database,
  clientId: string,
  blob: PlayerImageBlob,
  deleteBlobs: DeleteBlobs,
): Promise<{ id: string; url: string }> {
  const kind = imageBlobKind(clientId, "gallery", blob.pathname);
  if (!kind) {
    await deleteBlobs([blob.pathname]);
    throw new ConflictError("Invalid image path.");
  }

  const existing =
    kind === "player"
      ? await getPlayer(db, clientId)
      : await getCoach(db, clientId);
  if (!existing) {
    await deleteBlobs([blob.pathname]);
    throw new NotFoundError(kind === "player" ? "Player" : "Coach");
  }

  try {
    const [row] = await db
      .insert(schema.playerGalleryImages)
      .values({
        clientId,
        clientKind: kind,
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
  clientId: string,
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
      eq(schema.playerGalleryImages.clientId, clientId),
    ),
  });

  if (!image) {
    throw new NotFoundError("Image");
  }

  const player = await getPlayer(db, clientId);
  if (player) {
    const nextGallery = player.gallery.filter((item) => item.id !== imageId);
    if (
      player.visibility === "public" &&
      !isPlayerComplete({ ...player, gallery: nextGallery })
    ) {
      throw new ConflictError(
        "A Player cannot be public unless the profile is complete.",
      );
    }
  } else {
    const coach = await getCoach(db, clientId);
    if (coach) {
      const nextGallery = coach.gallery.filter((item) => item.id !== imageId);
      if (
        coach.visibility === "public" &&
        !isCoachComplete({ ...coach, gallery: nextGallery })
      ) {
        throw new ConflictError(
          "A Coach cannot be public unless the profile is complete.",
        );
      }
    }
  }

  await db
    .delete(schema.playerGalleryImages)
    .where(eq(schema.playerGalleryImages.id, imageId));

  if (image.storageKey) {
    await deleteBlobs([image.storageKey]);
  }
}

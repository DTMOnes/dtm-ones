import { eq } from "drizzle-orm";

import type { Database } from "./client";
import { DomainError } from "./errors";
import {
  categories,
  clients,
  playerGalleryImages,
  playerVideos,
  roster,
} from "./schema";

export type ClientKind = "player" | "coach";
export type Visibility = "public" | "private";

export type GalleryImageInput = {
  url: string;
  storageKey?: string | null;
  sortOrder?: number;
};

export type VideoInput = {
  youtubeUrl: string;
  sortOrder?: number;
};

export type StoreClientInput = {
  kind: ClientKind;
  name: string;
  nationality: string;
  lastClub: string;
  visibility: Visibility;
  heightCm?: number | null;
  categoryIds?: string[];
  presentationImageUrl?: string | null;
  presentationImageKey?: string | null;
  gallery?: GalleryImageInput[];
  videos?: VideoInput[];
};

export type StoredClient = {
  id: string;
};

export type RosterClient = {
  id: string;
  kind: ClientKind;
  name: string;
  nationality: string;
  lastClub: string;
  visibility: Visibility;
  heightCm: number | null;
  categoryId: string | null;
  presentationImageUrl: string | null;
  presentationImageKey: string | null;
};

export type StoredCategory = {
  id: string;
  name: string;
  slug: string;
};

export function createDomain(db: Database) {
  return {
    async createCategory(input: { name: string }): Promise<StoredCategory> {
      const slug = slugify(input.name);
      const [row] = await db
        .insert(categories)
        .values({ name: input.name, slug })
        .returning({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        });

      if (!row) {
        throw new Error("createCategory returned no row");
      }

      return row;
    },

    async storeClient(input: StoreClientInput): Promise<StoredClient> {
      if (input.kind === "coach" && hasPlayerFacts(input)) {
        throw new DomainError("player_facts_on_coach");
      }

      const categoryIds = input.categoryIds ?? [];
      if (categoryIds.length > 1) {
        throw new DomainError("player_has_at_most_one_category");
      }

      try {
        const [row] = await db
          .insert(clients)
          .values({
            kind: input.kind,
            name: input.name,
            nationality: input.nationality,
            lastClub: input.lastClub,
            visibility: input.visibility,
            heightCm: input.heightCm ?? null,
            categoryId: categoryIds[0] ?? null,
            presentationImageUrl: input.presentationImageUrl ?? null,
            presentationImageKey: input.presentationImageKey ?? null,
          })
          .returning({ id: clients.id, kind: clients.kind });

        if (!row) {
          throw new Error("storeClient returned no row");
        }

        if (input.gallery?.length) {
          await db.insert(playerGalleryImages).values(
            input.gallery.map((image, index) => ({
              clientId: row.id,
              clientKind: "player" as const,
              url: image.url,
              storageKey: image.storageKey ?? null,
              sortOrder: image.sortOrder ?? index,
            })),
          );
        }

        if (input.videos?.length) {
          await db.insert(playerVideos).values(
            input.videos.map((video, index) => ({
              clientId: row.id,
              clientKind: "player" as const,
              youtubeUrl: video.youtubeUrl,
              sortOrder: video.sortOrder ?? index,
            })),
          );
        }

        return { id: row.id };
      } catch (error) {
        if (isCoachPlayerFactsViolation(error)) {
          throw new DomainError("player_facts_on_coach");
        }
        throw error;
      }
    },

    async listRoster(): Promise<RosterClient[]> {
      const rows = await db.select().from(roster);
      return rows.map((row) => ({
        id: row.id,
        kind: row.kind,
        name: row.name,
        nationality: row.nationality,
        lastClub: row.lastClub,
        visibility: row.visibility,
        heightCm: row.heightCm,
        categoryId: row.categoryId,
        presentationImageUrl: row.presentationImageUrl,
        presentationImageKey: row.presentationImageKey,
      }));
    },

    async trashClient(id: string): Promise<void> {
      await db
        .update(clients)
        .set({ trashedAt: new Date(), updatedAt: new Date() })
        .where(eq(clients.id, id));
    },
  };
}

export type Domain = ReturnType<typeof createDomain>;

function hasPlayerFacts(input: StoreClientInput): boolean {
  return (
    input.heightCm != null ||
    (input.categoryIds != null && input.categoryIds.length > 0) ||
    input.presentationImageUrl != null ||
    input.presentationImageKey != null ||
    (input.gallery != null && input.gallery.length > 0) ||
    (input.videos != null && input.videos.length > 0)
  );
}

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "category";
}

function isCoachPlayerFactsViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const code = "code" in error ? error.code : undefined;
  const constraint =
    "constraint" in error ? error.constraint : undefined;
  const message = "message" in error ? String(error.message) : "";

  return (
    code === "23514" &&
    (constraint === "clients_coach_has_no_player_facts" ||
      constraint === "player_gallery_images_kind_player" ||
      constraint === "player_videos_kind_player" ||
      message.includes("clients_coach_has_no_player_facts") ||
      message.includes("player_gallery_images") ||
      message.includes("player_videos"))
  );
}

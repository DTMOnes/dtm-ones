import { z } from "zod";

import type {
  Player,
  PlayerCategoryRef,
  PlayerDetail,
  PlayerGalleryImage,
  PlayerListItem,
  PlayerVideo,
} from "@/types/player";

const heightCmStringSchema = z
  .string()
  .trim()
  .min(1, "Height is required.")
  .regex(/^\d{2,3}$/, {
    message: "Enter height in whole centimeters (e.g. 185).",
  })
  .refine((value) => {
    const n = Number.parseInt(value, 10);
    return n >= 100 && n <= 250;
  }, "Height must be between 100 and 250 cm.");

const categoryIdsSchema = z
  .array(z.uuid({ message: "Each category must be a valid ID." }))
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "Do not repeat the same category.",
  });

export const playerStatusSchema = z.enum(["draft", "published"]);

export const createPlayerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(150, "Maximum 150 characters."),
  nationality: z
    .string()
    .trim()
    .min(1, "Nationality is required.")
    .max(100, "Maximum 100 characters."),
  heightCm: heightCmStringSchema,
  lastClub: z
    .string()
    .trim()
    .min(1, "Last club is required.")
    .max(100, "Maximum 100 characters."),
  categoryIds: categoryIdsSchema,
});

export const updatePlayerSchema = z.object({
  id: z.uuid({ message: "Invalid player ID." }),
  fullName: z
    .string()
    .trim()
    .min(1, "Full name cannot be empty.")
    .max(150, "Maximum 150 characters."),
  nationality: z
    .string()
    .trim()
    .min(1, "Nationality cannot be empty.")
    .max(100, "Maximum 100 characters."),
  heightCm: heightCmStringSchema,
  lastClub: z
    .string()
    .trim()
    .min(1, "Last club cannot be empty.")
    .max(100, "Maximum 100 characters."),
  status: playerStatusSchema,
  categoryIds: categoryIdsSchema,
});

export const softDeletePlayerSchema = z.object({
  id: z.uuid({ message: "Invalid player ID." }),
});

export const playerIdSchema = z.object({
  playerId: z.uuid({ message: "Invalid player ID." }),
});

export const galleryImageIdSchema = z.object({
  imageId: z.uuid({ message: "Invalid image ID." }),
  playerId: z.uuid({ message: "Invalid player ID." }),
});

export const videoIdSchema = z.object({
  videoId: z.uuid({ message: "Invalid video ID." }),
  playerId: z.uuid({ message: "Invalid player ID." }),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type SoftDeletePlayerInput = z.infer<typeof softDeletePlayerSchema>;

export function parseHeightCm(value: string): number {
  return Number.parseInt(value, 10);
}

const playerRowSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1),
  full_name: z.string().min(1),
  nationality: z.string().min(1),
  height_cm: z.number().int(),
  last_club: z.string(),
  presentation_image_url: z.string().nullable(),
  status: playerStatusSchema,
  deleted_at: z.string().nullable(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

const categoryRefSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
});

const galleryImageSchema = z.object({
  id: z.uuid(),
  player_id: z.uuid(),
  url: z.string().min(1),
  sort_order: z.number().int(),
  created_at: z.string().min(1),
});

const videoSchema = z.object({
  id: z.uuid(),
  player_id: z.uuid(),
  youtube_url: z.string().min(1),
  sort_order: z.number().int(),
  created_at: z.string().min(1),
});

export function parsePlayer(value: unknown): Player | null {
  const parsed = playerRowSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

function parseCategoryRefs(value: unknown): PlayerCategoryRef[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const refs: PlayerCategoryRef[] = [];
  for (const junction of value) {
    if (typeof junction !== "object" || junction === null) {
      continue;
    }
    const categories = (junction as Record<string, unknown>).categories;
    const parsed = categoryRefSchema.safeParse(categories);
    if (parsed.success) {
      refs.push(parsed.data);
    }
  }
  return refs;
}

export function parsePlayerListItem(value: unknown): PlayerListItem | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const row = value as Record<string, unknown>;
  const player = parsePlayer({
    id: row.id,
    slug: row.slug,
    full_name: row.full_name,
    nationality: row.nationality,
    height_cm: row.height_cm,
    last_club: row.last_club,
    presentation_image_url: row.presentation_image_url,
    status: row.status,
    deleted_at: row.deleted_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });
  if (!player) {
    return null;
  }

  return {
    ...player,
    categories: parseCategoryRefs(row.player_categories),
  };
}

export function parsePlayerListItems(value: unknown): PlayerListItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const rows: PlayerListItem[] = [];
  for (const item of value) {
    const row = parsePlayerListItem(item);
    if (row) {
      rows.push(row);
    }
  }
  return rows;
}

function parseGalleryImages(value: unknown): PlayerGalleryImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const images: PlayerGalleryImage[] = [];
  for (const item of value) {
    const parsed = galleryImageSchema.safeParse(item);
    if (parsed.success) {
      images.push(parsed.data);
    }
  }
  return images.sort((a, b) => a.sort_order - b.sort_order);
}

function parseVideos(value: unknown): PlayerVideo[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const videos: PlayerVideo[] = [];
  for (const item of value) {
    const parsed = videoSchema.safeParse(item);
    if (parsed.success) {
      videos.push(parsed.data);
    }
  }
  return videos.sort((a, b) => a.sort_order - b.sort_order);
}

export function parsePlayerDetail(value: unknown): PlayerDetail | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const row = value as Record<string, unknown>;
  const player = parsePlayer({
    id: row.id,
    slug: row.slug,
    full_name: row.full_name,
    nationality: row.nationality,
    height_cm: row.height_cm,
    last_club: row.last_club,
    presentation_image_url: row.presentation_image_url,
    status: row.status,
    deleted_at: row.deleted_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });
  if (!player) {
    return null;
  }

  return {
    ...player,
    categories: parseCategoryRefs(row.player_categories),
    gallery_images: parseGalleryImages(row.player_gallery_images),
    videos: parseVideos(row.player_videos),
  };
}

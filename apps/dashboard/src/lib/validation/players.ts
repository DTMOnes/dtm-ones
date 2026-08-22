import { z } from "zod";

const requiredText = z.string().trim().min(1);

const optionalCategoryId = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.uuid().nullable(),
);

const optionalHeightCm = z.preprocess((value) => {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : Number(trimmed);
  }

  return value;
}, z.number().int().positive().nullable());

const optionalUrl = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.url().nullable(),
);

export const youtubeUrlSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (!URL.canParse(value)) {
      return false;
    }

    const host = new URL(value).hostname.replace(/^www\./, "").toLowerCase();
    return (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be"
    );
  }, "Enter a YouTube URL.");

export const updatePlayerSchema = z.object({
  id: z.uuid(),
  name: requiredText,
  nationality: requiredText,
  lastClub: requiredText,
  heightCm: optionalHeightCm,
  categoryId: optionalCategoryId,
  eurobasketLink: optionalUrl,
});

export const setPlayerVisibilitySchema = z.object({
  id: z.uuid(),
  visibility: z.enum(["public", "private"]),
});

export const addPlayerVideoSchema = z.object({
  playerId: z.uuid(),
  youtubeUrl: youtubeUrlSchema,
});

export const removePlayerVideoSchema = z.object({
  playerId: z.uuid(),
  videoId: z.uuid(),
});

export const playerBlobClientPayloadSchema = z.object({
  clientId: z.uuid(),
  kind: z.enum(["player", "coach"]),
  slot: z.enum(["presentation", "gallery"]),
});

export const commitPlayerImageSchema = z.object({
  clientId: z.uuid(),
  url: z.url(),
  pathname: z.string().trim().min(1),
});

export const clearPresentationImageSchema = z.object({
  clientId: z.uuid(),
});

export const removePlayerGalleryImageSchema = z.object({
  clientId: z.uuid(),
  imageId: z.uuid(),
});

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

const optionalText = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? null : value ?? null,
  z.string().trim().nullable(),
);

const optionalDate = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.iso.date("Use the format YYYY-MM-DD.").nullable(),
);

const optionalStat = z.preprocess((value) => {
  if (value == null || value === "") {
    return null;
  }

  return typeof value === "string" ? Number(value.trim()) : value;
}, z.number("Enter a number.").nonnegative().nullable());

/** One strength per line; blank lines are dropped. */
const strengthsList = z.preprocess(
  (value) =>
    typeof value === "string"
      ? value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : (value ?? []),
  z.array(z.string().max(80)).max(8),
);

/** All stat fields empty means no season line; any stat requires a season. */
const seasonStats = z.preprocess(
  (value) => value ?? {},
  z
    .object({
      season: optionalText,
      ppg: optionalStat,
      rpg: optionalStat,
      apg: optionalStat,
      mpg: optionalStat,
      spg: optionalStat,
      bpg: optionalStat,
      fgPct: optionalStat,
      threePct: optionalStat,
      ftPct: optionalStat,
    })
    .refine(
      (stats) =>
        stats.season !== null ||
        Object.values(stats).every((value) => value === null),
      { message: "Enter the season for these stats.", path: ["season"] },
    )
    .transform((stats) =>
      stats.season === null ? null : { ...stats, season: stats.season },
    ),
);

/** Instagram hashtag without "#": letters, numbers and underscores only. */
export const instagramHashtag = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value ?? null;
    const tag = value.trim().replace(/^#+/, "");
    return tag === "" ? null : tag;
  },
  z
    .string()
    .regex(/^[\p{L}\p{N}_]+$/u, "Use letters, numbers and _ only, no spaces.")
    .max(100)
    .nullable(),
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
  birthDate: optionalDate,
  league: optionalText,
  bio: optionalText,
  strengths: strengthsList,
  seasonStats,
  instagramHashtag,
});

export const setPlayerVisibilitySchema = z.object({
  id: z.uuid(),
  visibility: z.enum(["public", "private"]),
});

export const addPlayerVideoSchema = z.object({
  playerId: z.uuid(),
  youtubeUrl: youtubeUrlSchema,
  title: optionalText,
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

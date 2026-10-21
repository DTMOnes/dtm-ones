import { z } from "zod";

import { instagramHashtag } from "./players";

const requiredText = z.string().trim().min(1);

const optionalUrl = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.url().nullable(),
);

const optionalText = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? null : value ?? null,
  z.string().trim().nullable(),
);

export const updateCoachSchema = z.object({
  id: z.uuid(),
  name: requiredText,
  nationality: requiredText,
  lastClub: requiredText,
  eurobasketLink: optionalUrl,
  league: optionalText,
  bio: optionalText,
  instagramHashtag,
});

export const setCoachVisibilitySchema = z.object({
  id: z.uuid(),
  visibility: z.enum(["public", "private"]),
});

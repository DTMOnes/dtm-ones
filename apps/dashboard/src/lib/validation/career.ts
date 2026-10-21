import { z } from "zod";

const requiredText = z.string().trim().min(1);

const optionalText = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? null : value ?? null,
  z.string().trim().nullable(),
);

export const addCareerEntrySchema = z.object({
  clientId: z.uuid(),
  season: requiredText,
  club: requiredText,
  league: optionalText,
  country: optionalText,
});

export const removeCareerEntrySchema = z.object({
  clientId: z.uuid(),
  entryId: z.uuid(),
});

export const setCurrentCareerEntrySchema = z.object({
  clientId: z.uuid(),
  /** null clears the choice: the profile falls back to season order. */
  entryId: z.uuid().nullable(),
});

export const addAwardSchema = z.object({
  clientId: z.uuid(),
  title: requiredText,
  detail: optionalText,
  year: optionalText,
  kind: z.enum(["team", "individual"], "Choose team title or individual award."),
});

export const removeAwardSchema = z.object({
  clientId: z.uuid(),
  awardId: z.uuid(),
});

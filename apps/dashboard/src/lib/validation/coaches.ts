import { z } from "zod";

const requiredText = z.string().trim().min(1);

const optionalUrl = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.url().nullable(),
);

export const updateCoachSchema = z.object({
  id: z.uuid(),
  name: requiredText,
  nationality: requiredText,
  lastClub: requiredText,
  eurobasketLink: optionalUrl,
});

export const setCoachVisibilitySchema = z.object({
  id: z.uuid(),
  visibility: z.enum(["public", "private"]),
});

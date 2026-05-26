// Zod
import { z } from "zod";

export const landingMediaSchema = z.object({
  id: z.uuid(),
  mediaType: z.enum(["image", "video"]),
  mimeType: z.string(),
  storagePath: z.string(),
  createdAt: z.coerce.date(),
});

export const createLandingMediaSchema = landingMediaSchema.pick({
  id: true,
  mediaType: true,
  mimeType: true,
  storagePath: true,
});

export const deleteLandingMediaSchema = landingMediaSchema.pick({
  id: true,
});

export type LandingMediaData = z.infer<typeof landingMediaSchema>;
export type CreateLandingMediaData = z.infer<typeof createLandingMediaSchema>;

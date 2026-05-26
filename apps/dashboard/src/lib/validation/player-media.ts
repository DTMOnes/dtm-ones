// Zod
import { z } from "zod";

export const playerMediaSchema = z.object({
  id: z.uuid(),
  playerId: z.uuid(),
  mediaType: z.enum(["image", "video"]),
  mimeType: z.string(),
  storagePath: z.string(),
  createdAt: z.date(),
});

export const createPlayerMediaSchema = playerMediaSchema.pick({
  id: true,
  playerId: true,
  mediaType: true,
  mimeType: true,
  storagePath: true,
});

export const deletePlayerMediaSchema = playerMediaSchema.pick({
  id: true,
});

export type PlayerMediaData = z.infer<typeof playerMediaSchema>;
export type CreatePlayerMediaData = z.infer<typeof createPlayerMediaSchema>;

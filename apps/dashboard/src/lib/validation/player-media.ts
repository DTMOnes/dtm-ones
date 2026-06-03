// Zod
import { z } from "zod";

// Utils
import { parseYouTubeVideoId } from "@/lib/youtube";

export const youtubeVideoUrlSchema = z
  .string()
  .url()
  .refine((url) => parseYouTubeVideoId(url) !== null, {
    message: "Introduce una URL válida de YouTube.",
  });

export const uploadPlayerImageSchema = z.object({
  playerId: z.uuid(),
  url: z.url(),
});

export const uploadPlayerVideoSchema = z.object({
  playerId: z.uuid(),
  url: youtubeVideoUrlSchema,
});

export const deletePlayerImageSchema = z.object({
  id: z.uuid(),
});

export const deletePlayerVideoSchema = z.object({
  id: z.uuid(),
});

export const playerVideoFormSchema = z.object({
  url: youtubeVideoUrlSchema,
});

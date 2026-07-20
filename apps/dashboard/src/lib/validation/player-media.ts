import { parseYouTubeVideoId } from "@/lib/youtube";
import { z } from "zod";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const youtubeVideoUrlSchema = z
  .string()
  .url()
  .refine((url) => parseYouTubeVideoId(url) !== null, {
    message: "Enter a valid YouTube URL.",
  });

export const addPlayerVideoSchema = z.object({
  playerId: z.uuid({ message: "Invalid player ID." }),
  youtube_url: youtubeVideoUrlSchema,
});

export const playerVideoFormSchema = z.object({
  url: youtubeVideoUrlSchema,
});

export type AddPlayerVideoInput = z.infer<typeof addPlayerVideoSchema>;

import { parseYouTubeVideoId } from "@/lib/youtube";
import { z } from "zod";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const REJECTED_IMAGE_MIME_TYPES = [
  "image/heic",
  "image/heif",
] as const;

/** Raw picker / phone dump ceiling before decode. */
export const MAX_IMAGE_INPUT_BYTES = 20 * 1024 * 1024;

/** Post-normalize WebP ceiling. */
export const MAX_IMAGE_OUTPUT_BYTES = 1 * 1024 * 1024;

export const MAX_IMAGE_LONG_EDGE = 1600;

export const WEBP_QUALITY = 0.82;
export const WEBP_QUALITY_FALLBACK = 0.72;

export const PRESENTATION_BUCKET = "player-presentation";
export const GALLERY_BUCKET = "player-gallery";

/** @deprecated Use MAX_IMAGE_INPUT_BYTES / MAX_IMAGE_OUTPUT_BYTES. */
export const MAX_IMAGE_BYTES = MAX_IMAGE_INPUT_BYTES;

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

export const commitUploadedImageSchema = z.object({
  playerId: z.uuid({ message: "Invalid player ID." }),
  bucket: z.string().min(1),
  key: z.string().min(1),
  url: z.string().url(),
});

export const commitGalleryUploadedImageSchema = commitUploadedImageSchema.extend(
  {
    imageId: z.uuid({ message: "Invalid image ID." }),
  },
);

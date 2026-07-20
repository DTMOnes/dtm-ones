import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
} from "@/lib/validation/player-media";

export const INVALID_IMAGE =
  "Please upload a JPEG, PNG, or WebP image under 5 MB.";

export function extensionForImageMime(mimeType: string): string | null {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

export function validateImageFile(file: File): string | null {
  if (
    !(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    return INVALID_IMAGE;
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return INVALID_IMAGE;
  }

  return null;
}

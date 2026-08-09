import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_INPUT_BYTES,
  MAX_IMAGE_OUTPUT_BYTES,
  REJECTED_IMAGE_MIME_TYPES,
} from "@/lib/validation/player-media";

export const INVALID_IMAGE =
  "Please upload a JPEG, PNG, or WebP image under 20 MB. HEIC is not supported.";

export const INVALID_NORMALIZED_IMAGE =
  "Could not prepare that image for upload. Try another JPEG, PNG, or WebP.";

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

export function isRejectedImageMime(mimeType: string): boolean {
  return (REJECTED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isHeicFileName(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower.endsWith(".heic") || lower.endsWith(".heif");
}

export function validateImageFile(file: File): string | null {
  if (isRejectedImageMime(file.type) || isHeicFileName(file.name)) {
    return INVALID_IMAGE;
  }

  if (
    !(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    return INVALID_IMAGE;
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_INPUT_BYTES) {
    return INVALID_IMAGE;
  }

  return null;
}

export function validateNormalizedImageFile(file: File): string | null {
  if (file.type !== "image/webp") {
    return INVALID_NORMALIZED_IMAGE;
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_OUTPUT_BYTES) {
    return INVALID_NORMALIZED_IMAGE;
  }

  return null;
}

export function presentationImageKey(playerId: string): string {
  return `${playerId}/main.webp`;
}

export function galleryImageKey(playerId: string, imageId: string): string {
  return `${playerId}/${imageId}.webp`;
}

export function isExactUploadMatch(input: {
  expectedBucket: string;
  expectedKey: string;
  bucket: string;
  key: string;
  url: string;
}): boolean {
  if (input.bucket !== input.expectedBucket) {
    return false;
  }
  if (input.key !== input.expectedKey) {
    return false;
  }
  if (!input.url.includes(`/api/storage/buckets/${input.expectedBucket}/`)) {
    return false;
  }
  return true;
}

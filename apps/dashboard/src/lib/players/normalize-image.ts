"use client";

import {
  MAX_IMAGE_LONG_EDGE,
  MAX_IMAGE_OUTPUT_BYTES,
  WEBP_QUALITY,
  WEBP_QUALITY_FALLBACK,
} from "@/lib/validation/player-media";
import {
  INVALID_NORMALIZED_IMAGE,
  validateImageFile,
  validateNormalizedImageFile,
} from "@/lib/players/image-upload";

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(INVALID_NORMALIZED_IMAGE));
    };
    img.src = url;
  });
}

function canvasToWebpBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(INVALID_NORMALIZED_IMAGE));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}

/**
 * Decode, fit long edge to MAX_IMAGE_LONG_EDGE, encode WebP.
 * Retries once at softer quality if over MAX_IMAGE_OUTPUT_BYTES.
 */
export async function normalizePlayerImage(file: File): Promise<File> {
  const validationMessage = validateImageFile(file);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const image = await loadImageElement(file);
  const longEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const scale =
    longEdge > MAX_IMAGE_LONG_EDGE ? MAX_IMAGE_LONG_EDGE / longEdge : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error(INVALID_NORMALIZED_IMAGE);
  }
  context.drawImage(image, 0, 0, width, height);

  let blob = await canvasToWebpBlob(canvas, WEBP_QUALITY);
  if (blob.size > MAX_IMAGE_OUTPUT_BYTES) {
    blob = await canvasToWebpBlob(canvas, WEBP_QUALITY_FALLBACK);
  }

  const normalized = new File([blob], "image.webp", {
    type: "image/webp",
    lastModified: Date.now(),
  });

  const outputMessage = validateNormalizedImageFile(normalized);
  if (outputMessage) {
    throw new Error(outputMessage);
  }

  return normalized;
}

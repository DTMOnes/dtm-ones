"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import {
  NOT_FOUND,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import { assertActivePlayer } from "@/lib/players/assert-active-player";
import {
  extensionForImageMime,
  validateImageFile,
} from "@/lib/players/image-upload";
import { requireStaff } from "@/lib/require-staff";
import {
  galleryImageIdSchema,
  playerIdSchema,
} from "@/lib/validation/players";
import type { PlayerGalleryImage } from "@/types/player";
import { z } from "zod";

const GALLERY_BUCKET = "player-gallery";

const galleryImageRowSchema = z.object({
  id: z.uuid(),
  player_id: z.uuid(),
  url: z.string().min(1),
  sort_order: z.number().int(),
  created_at: z.string().min(1),
});

async function nextGallerySortOrder(
  playerId: string,
  actionName: string,
): Promise<ActionResult<{ sortOrder: number }>> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("player_gallery_images")
    .select("sort_order")
    .eq("player_id", playerId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (error) {
    console.error(`[${actionName}/sort]`, error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const first = Array.isArray(data) && data.length > 0 ? data[0] : null;
  const current =
    first &&
    typeof first === "object" &&
    "sort_order" in first &&
    typeof first.sort_order === "number"
      ? first.sort_order
      : -1;

  return { data: { sortOrder: current + 1 }, error: null };
}

export async function uploadGalleryImageAction(
  formData: FormData,
): Promise<ActionResult<{ image: PlayerGalleryImage }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const playerIdRaw = formData.get("playerId");
  const fileRaw = formData.get("file");

  const parsed = playerIdSchema.safeParse({
    playerId: typeof playerIdRaw === "string" ? playerIdRaw : "",
  });
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message: "The player could not be validated. Please try again.",
      },
    };
  }

  if (!(fileRaw instanceof File)) {
    return {
      data: null,
      error: { message: "Please choose an image file to upload." },
    };
  }

  const validationMessage = validateImageFile(fileRaw);
  if (validationMessage) {
    return { data: null, error: { message: validationMessage } };
  }

  const ext = extensionForImageMime(fileRaw.type);
  if (!ext) {
    return { data: null, error: { message: validationMessage ?? UNAVAILABLE } };
  }

  const playerGate = await assertActivePlayer(
    parsed.data.playerId,
    "uploadGallery",
  );
  if (playerGate.error) {
    return playerGate;
  }

  const sortResult = await nextGallerySortOrder(
    parsed.data.playerId,
    "uploadGallery",
  );
  if (sortResult.error) {
    return sortResult;
  }

  const imageId = randomUUID();
  const key = `${parsed.data.playerId}/${imageId}.${ext}`;
  const insforge = await createInsforgeServer();

  const { data: uploaded, error: uploadError } = await insforge.storage
    .from(GALLERY_BUCKET)
    .upload(key, fileRaw);

  if (uploadError || !uploaded?.url) {
    console.error("[uploadGallery]", uploadError);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const { data, error } = await insforge.database
    .from("player_gallery_images")
    .insert([
      {
        id: imageId,
        player_id: parsed.data.playerId,
        url: uploaded.url,
        sort_order: sortResult.data.sortOrder,
      },
    ])
    .select("id, player_id, url, sort_order, created_at");

  if (error) {
    console.error("[uploadGallery/db]", error);
    const { error: cleanupError } = await insforge.storage
      .from(GALLERY_BUCKET)
      .remove(key);
    if (cleanupError) {
      console.error("[uploadGallery/cleanup]", cleanupError);
    }
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const row = Array.isArray(data)
    ? data
        .map((item) => galleryImageRowSchema.safeParse(item))
        .find((item) => item.success)?.data
    : null;

  if (!row) {
    console.error("[uploadGallery]", "insert returned no gallery row");
    return { data: null, error: { message: UNAVAILABLE } };
  }

  revalidatePath(`/players/${parsed.data.playerId}`);
  return { data: { image: row }, error: null };
}

export async function deleteGalleryImageAction(input: {
  imageId: string;
  playerId: string;
}): Promise<ActionResult<null>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = galleryImageIdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message: "The image could not be validated. Please try again.",
      },
    };
  }

  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("player_gallery_images")
    .delete()
    .eq("id", parsed.data.imageId)
    .eq("player_id", parsed.data.playerId)
    .select("id, url");

  if (error) {
    console.error("[deleteGallery]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (!Array.isArray(data) || data.length === 0) {
    return { data: null, error: { message: NOT_FOUND } };
  }

  const url =
    typeof data[0] === "object" &&
    data[0] !== null &&
    "url" in data[0] &&
    typeof (data[0] as { url: unknown }).url === "string"
      ? (data[0] as { url: string }).url
      : null;

  if (url) {
    for (const ext of ["jpg", "png", "webp"]) {
      const key = `${parsed.data.playerId}/${parsed.data.imageId}.${ext}`;
      const { error: removeError } = await insforge.storage
        .from(GALLERY_BUCKET)
        .remove(key);
      if (removeError) {
        console.error("[deleteGallery/storage]", key, removeError);
      }
    }
  }

  revalidatePath(`/players/${parsed.data.playerId}`);
  return { data: null, error: null };
}

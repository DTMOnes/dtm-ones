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
  galleryImageKey,
  isExactUploadMatch,
} from "@/lib/players/image-upload";
import { requireStaff } from "@/utils/auth/require-staff";
import {
  commitGalleryUploadedImageSchema,
  GALLERY_BUCKET,
} from "@/lib/validation/player-media";
import {
  galleryImageIdSchema,
  playerIdSchema,
} from "@/lib/validation/players";
import type { PlayerGalleryImage } from "@/types/player";
import { z } from "zod";

const galleryImageRowSchema = z.object({
  id: z.uuid(),
  player_id: z.uuid(),
  url: z.string().min(1),
  storage_key: z.string().nullable(),
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

async function bestEffortRemoveGalleryKey(
  key: string,
  label: string,
): Promise<void> {
  const insforge = await createInsforgeServer();
  const { error } = await insforge.storage.from(GALLERY_BUCKET).remove(key);
  if (error) {
    console.error(`[${label}/remove]`, key, error);
  }
}

export async function beginGalleryImageUploadAction(input: {
  playerId: string;
}): Promise<ActionResult<{ bucket: string; key: string; imageId: string }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = playerIdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message: "The player could not be validated. Please try again.",
      },
    };
  }

  const playerGate = await assertActivePlayer(
    parsed.data.playerId,
    "beginGallery",
  );
  if (playerGate.error) {
    return playerGate;
  }

  const imageId = randomUUID();
  return {
    data: {
      bucket: GALLERY_BUCKET,
      key: galleryImageKey(parsed.data.playerId, imageId),
      imageId,
    },
    error: null,
  };
}

export async function commitGalleryImageUploadAction(input: {
  playerId: string;
  imageId: string;
  bucket: string;
  key: string;
  url: string;
}): Promise<ActionResult<{ image: PlayerGalleryImage }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = commitGalleryUploadedImageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message: "The upload could not be validated. Please try again.",
      },
    };
  }

  const expectedKey = galleryImageKey(
    parsed.data.playerId,
    parsed.data.imageId,
  );
  if (
    !isExactUploadMatch({
      expectedBucket: GALLERY_BUCKET,
      expectedKey,
      bucket: parsed.data.bucket,
      key: parsed.data.key,
      url: parsed.data.url,
    })
  ) {
    await bestEffortRemoveGalleryKey(
      parsed.data.key,
      "commitGallery/reject",
    );
    return {
      data: null,
      error: {
        message: "The uploaded file did not match the expected location.",
      },
    };
  }

  const playerGate = await assertActivePlayer(
    parsed.data.playerId,
    "commitGallery",
  );
  if (playerGate.error) {
    await bestEffortRemoveGalleryKey(parsed.data.key, "commitGallery/player");
    return playerGate;
  }

  const sortResult = await nextGallerySortOrder(
    parsed.data.playerId,
    "commitGallery",
  );
  if (sortResult.error) {
    await bestEffortRemoveGalleryKey(parsed.data.key, "commitGallery/sort");
    return sortResult;
  }

  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("player_gallery_images")
    .insert([
      {
        id: parsed.data.imageId,
        player_id: parsed.data.playerId,
        url: parsed.data.url,
        storage_key: parsed.data.key,
        sort_order: sortResult.data.sortOrder,
      },
    ])
    .select("id, player_id, url, storage_key, sort_order, created_at");

  if (error) {
    console.error("[commitGallery/db]", error);
    await bestEffortRemoveGalleryKey(parsed.data.key, "commitGallery/db");
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const row = Array.isArray(data)
    ? data
        .map((item) => galleryImageRowSchema.safeParse(item))
        .find((item) => item.success)?.data
    : null;

  if (!row) {
    console.error("[commitGallery]", "insert returned no gallery row");
    await bestEffortRemoveGalleryKey(parsed.data.key, "commitGallery/empty");
    return { data: null, error: { message: UNAVAILABLE } };
  }

  revalidatePath(`/players/${parsed.data.playerId}`);
  return {
    data: {
      image: {
        id: row.id,
        player_id: row.player_id,
        url: row.url,
        storage_key: row.storage_key,
        sort_order: row.sort_order,
        created_at: row.created_at,
      },
    },
    error: null,
  };
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
    .select("id, url, storage_key");

  if (error) {
    console.error("[deleteGallery]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (!Array.isArray(data) || data.length === 0) {
    return { data: null, error: { message: NOT_FOUND } };
  }

  const row = data[0];
  const storedKey =
    typeof row === "object" &&
    row !== null &&
    "storage_key" in row &&
    typeof (row as { storage_key: unknown }).storage_key === "string"
      ? (row as { storage_key: string }).storage_key
      : null;

  if (storedKey) {
    await bestEffortRemoveGalleryKey(storedKey, "deleteGallery");
  } else {
    for (const ext of ["jpg", "png", "webp"]) {
      const key = `${parsed.data.playerId}/${parsed.data.imageId}.${ext}`;
      await bestEffortRemoveGalleryKey(key, "deleteGallery/legacy");
    }
  }

  revalidatePath(`/players/${parsed.data.playerId}`);
  return { data: null, error: null };
}

"use server";

import { revalidatePath } from "next/cache";

import {
  NOT_FOUND,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import { assertActivePlayer } from "@/lib/players/assert-active-player";
import {
  isExactUploadMatch,
  presentationImageKey,
} from "@/lib/players/image-upload";
import { requireStaff } from "@/utils/auth/require-staff";
import {
  commitUploadedImageSchema,
  PRESENTATION_BUCKET,
} from "@/lib/validation/player-media";
import { playerIdSchema } from "@/lib/validation/players";

async function bestEffortRemoveKeys(
  keys: string[],
  label: string,
): Promise<void> {
  if (keys.length === 0) {
    return;
  }
  const insforge = await createInsforgeServer();
  const bucket = insforge.storage.from(PRESENTATION_BUCKET);
  for (const key of keys) {
    const { error } = await bucket.remove(key);
    if (error) {
      console.error(`[${label}/remove]`, key, error);
    }
  }
}

async function legacyPresentationKeys(playerId: string): Promise<string[]> {
  return ["jpg", "png", "webp"].map((ext) => `${playerId}/main.${ext}`);
}

export async function beginPresentationImageUploadAction(input: {
  playerId: string;
}): Promise<ActionResult<{ bucket: string; key: string }>> {
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
    "beginPresentation",
  );
  if (playerGate.error) {
    return playerGate;
  }

  const insforge = await createInsforgeServer();
  const { data: row, error } = await insforge.database
    .from("players")
    .select("presentation_image_key")
    .eq("id", parsed.data.playerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("[beginPresentation]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const storedKey =
    row &&
    typeof row === "object" &&
    "presentation_image_key" in row &&
    typeof (row as { presentation_image_key: unknown }).presentation_image_key ===
      "string"
      ? (row as { presentation_image_key: string }).presentation_image_key
      : null;

  const keysToRemove = storedKey
    ? [storedKey]
    : await legacyPresentationKeys(parsed.data.playerId);

  await bestEffortRemoveKeys(keysToRemove, "beginPresentation");

  return {
    data: {
      bucket: PRESENTATION_BUCKET,
      key: presentationImageKey(parsed.data.playerId),
    },
    error: null,
  };
}

export async function commitPresentationImageUploadAction(input: {
  playerId: string;
  bucket: string;
  key: string;
  url: string;
}): Promise<ActionResult<{ url: string; key: string }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = commitUploadedImageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message: "The upload could not be validated. Please try again.",
      },
    };
  }

  const expectedKey = presentationImageKey(parsed.data.playerId);
  if (
    !isExactUploadMatch({
      expectedBucket: PRESENTATION_BUCKET,
      expectedKey,
      bucket: parsed.data.bucket,
      key: parsed.data.key,
      url: parsed.data.url,
    })
  ) {
    await bestEffortRemoveKeys([parsed.data.key], "commitPresentation/reject");
    return {
      data: null,
      error: {
        message: "The uploaded file did not match the expected location.",
      },
    };
  }

  const playerGate = await assertActivePlayer(
    parsed.data.playerId,
    "commitPresentation",
  );
  if (playerGate.error) {
    await bestEffortRemoveKeys([parsed.data.key], "commitPresentation/player");
    return playerGate;
  }

  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("players")
    .update({
      presentation_image_url: parsed.data.url,
      presentation_image_key: parsed.data.key,
    })
    .eq("id", parsed.data.playerId)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    console.error("[commitPresentation/db]", error);
    await bestEffortRemoveKeys([parsed.data.key], "commitPresentation/db");
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (!Array.isArray(data) || data.length === 0) {
    await bestEffortRemoveKeys([parsed.data.key], "commitPresentation/missing");
    return { data: null, error: { message: NOT_FOUND } };
  }

  revalidatePath(`/players/${parsed.data.playerId}`);
  revalidatePath("/players");
  return {
    data: { url: parsed.data.url, key: parsed.data.key },
    error: null,
  };
}

export async function clearPresentationImageAction(input: {
  playerId: string;
}): Promise<ActionResult<null>> {
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
    "clearPresentation",
  );
  if (playerGate.error) {
    return playerGate;
  }

  const insforge = await createInsforgeServer();
  const { data: existing, error: readError } = await insforge.database
    .from("players")
    .select("presentation_image_key")
    .eq("id", parsed.data.playerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (readError) {
    console.error("[clearPresentation/read]", readError);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const storedKey =
    existing &&
    typeof existing === "object" &&
    "presentation_image_key" in existing &&
    typeof (existing as { presentation_image_key: unknown })
      .presentation_image_key === "string"
      ? (existing as { presentation_image_key: string }).presentation_image_key
      : null;

  const { data, error } = await insforge.database
    .from("players")
    .update({
      presentation_image_url: null,
      presentation_image_key: null,
    })
    .eq("id", parsed.data.playerId)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    console.error("[clearPresentation]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (!Array.isArray(data) || data.length === 0) {
    return { data: null, error: { message: NOT_FOUND } };
  }

  const keysToRemove = storedKey
    ? [storedKey]
    : await legacyPresentationKeys(parsed.data.playerId);
  await bestEffortRemoveKeys(keysToRemove, "clearPresentation");

  revalidatePath(`/players/${parsed.data.playerId}`);
  revalidatePath("/players");
  return { data: null, error: null };
}

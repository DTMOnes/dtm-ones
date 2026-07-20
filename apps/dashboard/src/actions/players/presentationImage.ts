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
  extensionForImageMime,
  validateImageFile,
} from "@/lib/players/image-upload";
import { requireStaff } from "@/lib/require-staff";
import { playerIdSchema } from "@/lib/validation/players";

const PRESENTATION_BUCKET = "player-presentation";

async function bestEffortRemovePresentationObjects(
  playerId: string,
): Promise<void> {
  const insforge = await createInsforgeServer();
  const bucket = insforge.storage.from(PRESENTATION_BUCKET);
  for (const ext of ["jpg", "png", "webp"]) {
    const key = `${playerId}/main.${ext}`;
    const { error } = await bucket.remove(key);
    if (error) {
      console.error("[uploadPresentation/remove]", key, error);
    }
  }
}

export async function uploadPresentationImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
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
    "uploadPresentation",
  );
  if (playerGate.error) {
    return playerGate;
  }

  await bestEffortRemovePresentationObjects(parsed.data.playerId);

  const insforge = await createInsforgeServer();
  const key = `${parsed.data.playerId}/main.${ext}`;
  const { data: uploaded, error: uploadError } = await insforge.storage
    .from(PRESENTATION_BUCKET)
    .upload(key, fileRaw);

  if (uploadError || !uploaded?.url) {
    console.error("[uploadPresentation]", uploadError);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const { data, error } = await insforge.database
    .from("players")
    .update({ presentation_image_url: uploaded.url })
    .eq("id", parsed.data.playerId)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    console.error("[uploadPresentation/db]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (!Array.isArray(data) || data.length === 0) {
    return { data: null, error: { message: NOT_FOUND } };
  }

  revalidatePath(`/players/${parsed.data.playerId}`);
  revalidatePath("/players");
  return { data: { url: uploaded.url }, error: null };
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
  const { data, error } = await insforge.database
    .from("players")
    .update({ presentation_image_url: null })
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

  await bestEffortRemovePresentationObjects(parsed.data.playerId);

  revalidatePath(`/players/${parsed.data.playerId}`);
  revalidatePath("/players");
  return { data: null, error: null };
}

"use server";

import { revalidatePath } from "next/cache";

import {
  NOT_FOUND,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import { allocateUniquePlayerSlug } from "@/lib/players/allocate-slug";
import { replacePlayerCategories } from "@/lib/players/replace-categories";
import { requireStaff } from "@/lib/require-staff";
import {
  parseHeightCm,
  parsePlayer,
  updatePlayerSchema,
} from "@/lib/validation/players";
import type { Player } from "@/types/player";

const PLAYER_COLUMNS =
  "id, slug, full_name, nationality, height_cm, presentation_image_url, status, deleted_at, created_at, updated_at";

const SLUG_MAX_RETRIES = 5;

function isUniqueSlugViolation(error: unknown): boolean {
  const message = String(
    typeof error === "object" && error !== null && "message" in error
      ? (error as { message: unknown }).message
      : error,
  );
  return /players_slug|duplicate key|unique/i.test(message);
}

export async function updatePlayerAction(input: {
  id: string;
  fullName: string;
  nationality: string;
  heightCm: string;
  status: string;
  categoryIds: string[];
}): Promise<ActionResult<{ player: Player }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = updatePlayerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message:
          parsed.error.issues[0]?.message ??
          "The player could not be validated. Please try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const insforge = await createInsforgeServer();

  const { data: existingRows, error: existingError } = await insforge.database
    .from("players")
    .select("id, full_name, slug")
    .eq("id", parsed.data.id)
    .is("deleted_at", null)
    .limit(1);

  if (existingError) {
    console.error("[updatePlayer]", existingError);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const existing =
    Array.isArray(existingRows) && existingRows.length > 0
      ? existingRows[0]
      : null;

  if (
    !existing ||
    typeof existing !== "object" ||
    !("full_name" in existing) ||
    typeof existing.full_name !== "string"
  ) {
    return { data: null, error: { message: NOT_FOUND } };
  }

  const heightCm = parseHeightCm(parsed.data.heightCm);
  const nameChanged = existing.full_name !== parsed.data.fullName;
  const currentSlug =
    "slug" in existing && typeof existing.slug === "string"
      ? existing.slug
      : null;

  let lastError: unknown = null;

  for (let attempt = 0; attempt < SLUG_MAX_RETRIES; attempt += 1) {
    let slug = currentSlug;
    if (nameChanged || slug === null) {
      const slugResult = await allocateUniquePlayerSlug(
        insforge,
        parsed.data.fullName,
        parsed.data.id,
        "updatePlayer",
      );
      if (slugResult.error) {
        return slugResult;
      }
      slug = slugResult.data.slug;
    }

    const { data, error } = await insforge.database
      .from("players")
      .update({
        full_name: parsed.data.fullName,
        nationality: parsed.data.nationality,
        height_cm: heightCm,
        status: parsed.data.status,
        slug,
      })
      .eq("id", parsed.data.id)
      .is("deleted_at", null)
      .select(PLAYER_COLUMNS);

    if (error) {
      lastError = error;
      if (isUniqueSlugViolation(error)) {
        continue;
      }
      console.error("[updatePlayer]", error);
      return { data: null, error: { message: UNAVAILABLE } };
    }

    const row = Array.isArray(data)
      ? data.map((item) => parsePlayer(item)).find((item) => item !== null)
      : null;

    if (!row) {
      return { data: null, error: { message: NOT_FOUND } };
    }

    const categoriesResult = await replacePlayerCategories(
      insforge,
      row.id,
      parsed.data.categoryIds,
      "updatePlayer",
    );
    if (categoriesResult.error) {
      return categoriesResult;
    }

    revalidatePath("/players");
    revalidatePath(`/players/${row.id}`);
    return { data: { player: row }, error: null };
  }

  console.error("[updatePlayer]", "slug retries exhausted", lastError);
  return { data: null, error: { message: UNAVAILABLE } };
}

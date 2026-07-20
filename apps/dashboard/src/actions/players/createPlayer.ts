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
  createPlayerSchema,
  parseHeightCm,
  parsePlayer,
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

export async function createPlayerAction(input: {
  fullName: string;
  nationality: string;
  heightCm: string;
  categoryIds: string[];
}): Promise<ActionResult<{ player: Player }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = createPlayerSchema.safeParse(input);
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
  const heightCm = parseHeightCm(parsed.data.heightCm);

  let lastError: unknown = null;

  for (let attempt = 0; attempt < SLUG_MAX_RETRIES; attempt += 1) {
    const slugResult = await allocateUniquePlayerSlug(
      insforge,
      parsed.data.fullName,
      null,
      "createPlayer",
    );
    if (slugResult.error) {
      return slugResult;
    }

    const { data, error } = await insforge.database
      .from("players")
      .insert([
        {
          full_name: parsed.data.fullName,
          nationality: parsed.data.nationality,
          height_cm: heightCm,
          slug: slugResult.data.slug,
          status: "draft",
        },
      ])
      .select(PLAYER_COLUMNS);

    if (error) {
      lastError = error;
      if (isUniqueSlugViolation(error)) {
        continue;
      }
      console.error("[createPlayer]", error);
      return { data: null, error: { message: UNAVAILABLE } };
    }

    const row = Array.isArray(data)
      ? data.map((item) => parsePlayer(item)).find((item) => item !== null)
      : null;

    if (!row) {
      console.error("[createPlayer]", "insert returned no player row");
      return { data: null, error: { message: UNAVAILABLE } };
    }

    const categoriesResult = await replacePlayerCategories(
      insforge,
      row.id,
      parsed.data.categoryIds,
      "createPlayer",
    );
    if (categoriesResult.error) {
      return categoriesResult;
    }

    revalidatePath("/players");
    return { data: { player: row }, error: null };
  }

  console.error("[createPlayer]", "slug retries exhausted", lastError);
  return { data: null, error: { message: UNAVAILABLE } };
}

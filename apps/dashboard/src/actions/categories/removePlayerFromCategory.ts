"use server";

import { revalidatePath } from "next/cache";

import { findCategoryById } from "@/actions/categories/findCategoryById";
import {
  NOT_FOUND,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import { requireStaff } from "@/lib/require-staff";
import { removePlayerFromCategorySchema } from "@/lib/validation/categories";

export async function removePlayerFromCategoryAction(input: {
  categoryId: string;
  playerId: string;
}): Promise<ActionResult<null>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = removePlayerFromCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message:
          "The request could not be validated. Please try again.",
      },
    };
  }

  const existingResult = await findCategoryById(
    parsed.data.categoryId,
    "removePlayerFromCategory",
  );
  if (existingResult.error) {
    return existingResult;
  }

  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("player_categories")
    .delete()
    .eq("category_id", parsed.data.categoryId)
    .eq("player_id", parsed.data.playerId)
    .select("player_id");

  if (error) {
    console.error("[removePlayerFromCategory]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (!Array.isArray(data) || data.length === 0) {
    return { data: null, error: { message: NOT_FOUND } };
  }

  revalidatePath("/categories");
  revalidatePath(`/categories/${parsed.data.categoryId}`);
  return { data: null, error: null };
}

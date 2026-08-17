"use server";

import { revalidatePath } from "next/cache";

import { findCategoryById } from "@/actions/categories/findCategoryById";
import {
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import { requireStaff } from "@/utils/auth/require-staff";
import { deleteCategorySchema } from "@/lib/validation/categories";

export async function deleteCategoryAction(input: {
  id: string;
}): Promise<ActionResult<{ id: string }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = deleteCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message:
          "The category could not be validated. Please try again.",
      },
    };
  }

  const existingResult = await findCategoryById(
    parsed.data.id,
    "deleteCategory",
  );
  if (existingResult.error) {
    return existingResult;
  }

  const insforge = await createInsforgeServer();
  const { error: deleteError } = await insforge.database
    .from("categories")
    .delete()
    .eq("id", parsed.data.id);

  if (deleteError) {
    console.error("[deleteCategory]", deleteError);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  revalidatePath("/categories");
  revalidatePath(`/categories/${parsed.data.id}`);
  return { data: { id: parsed.data.id }, error: null };
}

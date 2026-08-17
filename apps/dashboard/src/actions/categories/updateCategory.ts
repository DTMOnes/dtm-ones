"use server";

import { revalidatePath } from "next/cache";

import { findCategoryById } from "@/actions/categories/findCategoryById";
import {
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { allocateUniqueCategorySlug } from "@/lib/categories/allocate-slug";
import {
  assertCategoryNameAvailable,
  CATEGORY_NAME_TAKEN,
} from "@/lib/categories/assert-name-available";
import { createInsforgeServer } from "@/lib/insforge-server";
import { requireStaff } from "@/utils/auth/require-staff";
import {
  parseCategory,
  updateCategorySchema,
} from "@/lib/validation/categories";
import type { Category } from "@/types/category";

const CATEGORY_COLUMNS = "id, name, slug, created_at, updated_at";

export async function updateCategoryAction(input: {
  id: string;
  name: string;
}): Promise<ActionResult<{ category: Category }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message:
          parsed.error.issues[0]?.message ??
          "The category could not be validated. Please try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const existingResult = await findCategoryById(
    parsed.data.id,
    "updateCategory",
  );
  if (existingResult.error) {
    return existingResult;
  }

  const insforge = await createInsforgeServer();
  const nameGate = await assertCategoryNameAvailable(
    insforge,
    parsed.data.name,
    parsed.data.id,
    "updateCategory",
  );
  if (nameGate.error) {
    return nameGate;
  }

  const slugResult = await allocateUniqueCategorySlug(
    insforge,
    parsed.data.name,
    parsed.data.id,
    "updateCategory",
  );
  if (slugResult.error) {
    return slugResult;
  }

  const { data, error } = await insforge.database
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: slugResult.data.slug,
    })
    .eq("id", parsed.data.id)
    .select(CATEGORY_COLUMNS);

  if (error) {
    console.error("[updateCategory]", error);
    const message = String(
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: unknown }).message
        : error,
    );
    if (/categories_name|duplicate key|unique/i.test(message)) {
      return {
        data: null,
        error: {
          message: CATEGORY_NAME_TAKEN,
          fieldErrors: { name: [CATEGORY_NAME_TAKEN] },
        },
      };
    }
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const row = Array.isArray(data)
    ? data.map((item) => parseCategory(item)).find((item) => item !== null)
    : null;

  if (!row) {
    console.error("[updateCategory]", "update returned no category row");
    return { data: null, error: { message: UNAVAILABLE } };
  }

  revalidatePath("/categories");
  revalidatePath(`/categories/${parsed.data.id}`);
  return { data: { category: row }, error: null };
}

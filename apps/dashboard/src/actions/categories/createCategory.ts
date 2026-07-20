"use server";

import { revalidatePath } from "next/cache";

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
import { requireStaff } from "@/lib/require-staff";
import {
  createCategorySchema,
  parseCategory,
} from "@/lib/validation/categories";
import type { Category } from "@/types/category";

const CATEGORY_COLUMNS = "id, name, slug, created_at, updated_at";

export async function createCategoryAction(input: {
  name: string;
}): Promise<ActionResult<{ category: Category }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = createCategorySchema.safeParse(input);
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

  const insforge = await createInsforgeServer();
  const nameGate = await assertCategoryNameAvailable(
    insforge,
    parsed.data.name,
    null,
    "createCategory",
  );
  if (nameGate.error) {
    return nameGate;
  }

  const slugResult = await allocateUniqueCategorySlug(
    insforge,
    parsed.data.name,
    null,
    "createCategory",
  );
  if (slugResult.error) {
    return slugResult;
  }

  const { data, error } = await insforge.database
    .from("categories")
    .insert([
      {
        name: parsed.data.name,
        slug: slugResult.data.slug,
      },
    ])
    .select(CATEGORY_COLUMNS);

  if (error) {
    console.error("[createCategory]", error);
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
    console.error("[createCategory]", "insert returned no category row");
    return { data: null, error: { message: UNAVAILABLE } };
  }

  revalidatePath("/categories");
  return { data: { category: row }, error: null };
}

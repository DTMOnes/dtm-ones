"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { deleteCategorySchema } from "@/lib/validation/categories";
import { deleteCategory } from "@/utils/categories";

export const deleteCategoryAction = staffActionClient
  .metadata({ actionName: "deleteCategory" })
  .inputSchema(deleteCategorySchema)
  .action(async ({ parsedInput }) => {
    await deleteCategory(db, parsedInput.id);

    revalidatePath("/categories");

    return { ok: true as const };
  });

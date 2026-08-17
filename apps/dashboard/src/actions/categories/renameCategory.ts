"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { renameCategorySchema } from "@/lib/validation/categories";
import { renameCategory } from "@/utils/categories";

export const renameCategoryAction = staffActionClient
  .metadata({ actionName: "renameCategory" })
  .inputSchema(renameCategorySchema)
  .action(async ({ parsedInput }) => {
    const category = await renameCategory(
      db,
      parsedInput.id,
      parsedInput.name,
    );

    revalidatePath("/categories");
    revalidatePath(`/categories/${parsedInput.id}`);

    return { ok: true as const, category };
  });

"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { createCategorySchema } from "@/lib/validation/categories";
import { createCategory } from "@/utils/categories";

export const createCategoryAction = staffActionClient
  .metadata({ actionName: "createCategory" })
  .inputSchema(createCategorySchema)
  .action(async ({ parsedInput }) => {
    const category = await createCategory(db, parsedInput.name);

    revalidatePath("/categories");

    return { ok: true as const, category };
  });

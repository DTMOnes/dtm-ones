"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { createCoachSchema } from "@/lib/validation/coaches";
import { createCoach } from "@/utils/coaches";

export const createCoachAction = staffActionClient
  .metadata({ actionName: "createCoach" })
  .inputSchema(createCoachSchema)
  .action(async ({ parsedInput }) => {
    const coach = await createCoach(db, parsedInput);

    revalidatePath("/coaches");

    return { ok: true as const, coach };
  });

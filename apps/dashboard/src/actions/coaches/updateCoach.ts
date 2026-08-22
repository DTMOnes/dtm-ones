"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { updateCoachSchema } from "@/lib/validation/coaches";
import { updateCoach } from "@/utils/coaches";

export const updateCoachAction = staffActionClient
  .metadata({ actionName: "updateCoach" })
  .inputSchema(updateCoachSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...patch } = parsedInput;
    const coach = await updateCoach(db, id, patch);

    revalidatePath("/clients");
    revalidatePath(`/coaches/${id}`);

    return { ok: true as const, coach };
  });

"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { setCoachVisibilitySchema } from "@/lib/validation/coaches";
import { setCoachVisibility } from "@/utils/coaches";

export const setCoachVisibilityAction = staffActionClient
  .metadata({ actionName: "setCoachVisibility" })
  .inputSchema(setCoachVisibilitySchema)
  .action(async ({ parsedInput }) => {
    const coach = await setCoachVisibility(
      db,
      parsedInput.id,
      parsedInput.visibility,
    );

    revalidatePath("/coaches");
    revalidatePath(`/coaches/${parsedInput.id}`);

    return { ok: true as const, coach };
  });

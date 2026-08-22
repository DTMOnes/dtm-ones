"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { setPlayerVisibilitySchema } from "@/lib/validation/players";
import { setPlayerVisibility } from "@/utils/players";

export const setPlayerVisibilityAction = staffActionClient
  .metadata({ actionName: "setPlayerVisibility" })
  .inputSchema(setPlayerVisibilitySchema)
  .action(async ({ parsedInput }) => {
    const player = await setPlayerVisibility(
      db,
      parsedInput.id,
      parsedInput.visibility,
    );

    revalidatePath("/clients");
    revalidatePath(`/clients/${parsedInput.id}`);

    return { ok: true as const, player };
  });

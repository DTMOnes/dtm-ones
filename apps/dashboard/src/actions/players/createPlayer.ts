"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { createPlayerSchema } from "@/lib/validation/players";
import { createPlayer } from "@/utils/players";

export const createPlayerAction = staffActionClient
  .metadata({ actionName: "createPlayer" })
  .inputSchema(createPlayerSchema)
  .action(async ({ parsedInput }) => {
    const player = await createPlayer(db, parsedInput);

    revalidatePath("/players");

    return { ok: true as const, player };
  });

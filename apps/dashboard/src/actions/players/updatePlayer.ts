"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { updatePlayerSchema } from "@/lib/validation/players";
import { updatePlayer } from "@/utils/players";

export const updatePlayerAction = staffActionClient
  .metadata({ actionName: "updatePlayer" })
  .inputSchema(updatePlayerSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...patch } = parsedInput;
    const player = await updatePlayer(db, id, patch);

    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);

    return { ok: true as const, player };
  });

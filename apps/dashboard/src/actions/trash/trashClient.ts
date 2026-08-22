"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { clientIdSchema } from "@/lib/validation/clients";
import { trashClient } from "@/utils/trash";

export const trashClientAction = staffActionClient
  .metadata({ actionName: "trashClient" })
  .inputSchema(clientIdSchema)
  .action(async ({ parsedInput }) => {
    await trashClient(db, parsedInput.id);

    revalidatePath("/clients");
    revalidatePath("/trash");
    revalidatePath(`/players/${parsedInput.id}`);
    revalidatePath(`/coaches/${parsedInput.id}`);

    return { ok: true as const };
  });

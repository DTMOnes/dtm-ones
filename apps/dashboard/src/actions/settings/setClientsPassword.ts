"use server";

import { revalidatePath } from "next/cache";
import { setRosterPassword } from "@dtm/database";

import { db } from "@/lib/db";
import { ownerActionClient } from "@/lib/safe-action";
import { setClientsPasswordSchema } from "@/lib/validation/settings";

/** Owner only: the password visitors type to see the landing Clients list. */
export const setClientsPasswordAction = ownerActionClient
  .metadata({ actionName: "setClientsPassword" })
  .inputSchema(setClientsPasswordSchema)
  .action(async ({ parsedInput }) => {
    await setRosterPassword(db, parsedInput.password);

    revalidatePath("/settings");

    return { ok: true as const };
  });

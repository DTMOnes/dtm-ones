"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { createClientSchema } from "@/lib/validation/clients";
import { createClient } from "@/utils/clients";

export const createClientAction = staffActionClient
  .metadata({ actionName: "createClient" })
  .inputSchema(createClientSchema)
  .action(async ({ parsedInput }) => {
    const client = await createClient(db, parsedInput);

    revalidatePath("/clients");

    return { ok: true as const, client };
  });

"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { clientIdSchema } from "@/lib/validation/clients";
import { restoreClient } from "@/utils/trash";

export const restoreClientAction = staffActionClient
  .metadata({ actionName: "restoreClient" })
  .inputSchema(clientIdSchema)
  .action(async ({ parsedInput }) => {
    await restoreClient(db, parsedInput.id);

    revalidatePath("/clients");
    revalidatePath("/trash");
    revalidatePath(`/clients/${parsedInput.id}`);

    return { ok: true as const };
  });

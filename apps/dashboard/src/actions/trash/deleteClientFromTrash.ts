"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { clientIdSchema } from "@/lib/validation/clients";
import { deleteClientFromTrash } from "@/utils/trash";

export const deleteClientFromTrashAction = staffActionClient
  .metadata({ actionName: "deleteClientFromTrash" })
  .inputSchema(clientIdSchema)
  .action(async ({ parsedInput }) => {
    await deleteClientFromTrash(db, parsedInput.id, async (keys) => {
      if (keys.length > 0) {
        await del(keys);
      }
    });

    revalidatePath("/trash");

    return { ok: true as const };
  });

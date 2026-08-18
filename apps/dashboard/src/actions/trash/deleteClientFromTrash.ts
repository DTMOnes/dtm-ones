"use server";

import { revalidatePath } from "next/cache";

import { deleteBlobs } from "@/lib/blob";
import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { clientIdSchema } from "@/lib/validation/clients";
import { deleteClientFromTrash } from "@/utils/trash";

export const deleteClientFromTrashAction = staffActionClient
  .metadata({ actionName: "deleteClientFromTrash" })
  .inputSchema(clientIdSchema)
  .action(async ({ parsedInput }) => {
    await deleteClientFromTrash(db, parsedInput.id, deleteBlobs);

    revalidatePath("/trash");

    return { ok: true as const };
  });

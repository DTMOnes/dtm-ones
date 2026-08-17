"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { contactRequestIdSchema } from "@/lib/validation/contact-requests";
import { deleteContactRequest } from "@/utils/contact-requests";

export const deleteContactRequestAction = staffActionClient
  .metadata({ actionName: "deleteContactRequest" })
  .inputSchema(contactRequestIdSchema)
  .action(async ({ parsedInput }) => {
    await deleteContactRequest(db, parsedInput.id);

    revalidatePath("/contacts");

    return { ok: true as const };
  });

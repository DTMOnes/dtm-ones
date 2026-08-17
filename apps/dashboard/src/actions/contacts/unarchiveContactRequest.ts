"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { contactRequestIdSchema } from "@/lib/validation/contact-requests";
import { unarchiveContactRequest } from "@/utils/contact-requests";

export const unarchiveContactRequestAction = staffActionClient
  .metadata({ actionName: "unarchiveContactRequest" })
  .inputSchema(contactRequestIdSchema)
  .action(async ({ parsedInput }) => {
    const contactRequest = await unarchiveContactRequest(db, parsedInput.id);

    revalidatePath("/contacts");

    return { ok: true as const, contactRequest };
  });

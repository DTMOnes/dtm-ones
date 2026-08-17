"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { contactRequestIdSchema } from "@/lib/validation/contact-requests";
import { archiveContactRequest } from "@/utils/contact-requests";

export const archiveContactRequestAction = staffActionClient
  .metadata({ actionName: "archiveContactRequest" })
  .inputSchema(contactRequestIdSchema)
  .action(async ({ parsedInput }) => {
    const contactRequest = await archiveContactRequest(db, parsedInput.id);

    revalidatePath("/contacts");

    return { ok: true as const, contactRequest };
  });

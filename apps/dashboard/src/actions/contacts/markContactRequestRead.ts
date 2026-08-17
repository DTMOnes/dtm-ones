"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import { contactRequestIdSchema } from "@/lib/validation/contact-requests";
import { markContactRequestRead } from "@/utils/contact-requests";

export const markContactRequestReadAction = staffActionClient
  .metadata({ actionName: "markContactRequestRead" })
  .inputSchema(contactRequestIdSchema)
  .action(async ({ parsedInput }) => {
    const contactRequest = await markContactRequestRead(db, parsedInput.id);

    revalidatePath("/contacts");

    return { ok: true as const, contactRequest };
  });

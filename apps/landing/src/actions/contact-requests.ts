"use server";

import { schema } from "@dtm/database";

import { db } from "@/lib/db";
import { actionClient } from "@/lib/safe-action";
import { createContactRequestSchema } from "@/lib/validation/contact-requests";

export const createContactRequestAction = actionClient
  .metadata({ actionName: "createContactRequest" })
  .inputSchema(createContactRequestSchema)
  .action(async ({ parsedInput }) => {
    await db.insert(schema.contactRequests).values({
      reason: parsedInput.reason,
      email: parsedInput.email,
      phone: parsedInput.phone,
      message: parsedInput.message,
    });

    return {
      ok: true as const,
      message: "Your message was sent successfully.",
    };
  });

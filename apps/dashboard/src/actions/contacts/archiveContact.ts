"use server";

import { updateContact } from "@/actions/contacts/updateContact";
import type { ActionResult } from "@/lib/action-result";
import { requireStaff } from "@/lib/require-staff";
import type { ContactRequest } from "@/types/contact-request";
import { contactRequestIdSchema } from "@/lib/validation/contacts";

export async function archiveContactAction(input: {
  id: string;
}): Promise<ActionResult<{ request: ContactRequest }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = contactRequestIdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message:
          "The contact request could not be validated. Please try again.",
      },
    };
  }

  return updateContact({
    actionName: "archiveContact",
    id: parsed.data.id,
    fromStatuses: ["new", "read"],
    toStatus: "archived",
  });
}

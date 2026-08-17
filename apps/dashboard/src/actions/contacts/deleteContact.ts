"use server";

import { revalidatePath } from "next/cache";

import { findContactById } from "@/actions/contacts/findContactById";
import {
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import { requireStaff } from "@/utils/auth/require-staff";
import { contactRequestIdSchema } from "@/lib/validation/contacts";

export async function deleteContactAction(input: {
  id: string;
}): Promise<ActionResult<null>> {
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

  const existingResult = await findContactById(
    parsed.data.id,
    "deleteContact",
  );
  if (existingResult.error) {
    return existingResult;
  }

  const insforge = await createInsforgeServer();
  const { error: deleteError } = await insforge.database
    .from("contact_requests")
    .delete()
    .eq("id", parsed.data.id);

  if (deleteError) {
    console.error("[deleteContact]", deleteError);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  revalidatePath("/contacts");
  return { data: null, error: null };
}

"use server";

import {
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  createContactRequestSchema,
  type CreateContactRequest,
} from "@/lib/validation/contact-requests";

export async function createContactRequest(
  input: CreateContactRequest,
): Promise<ActionResult<{ success: true; message: string }>> {
  const parsed = createContactRequestSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      data: null,
      error: {
        message: "Please review the highlighted fields and try again.",
        fieldErrors: fieldErrors as Record<string, string[]>,
      },
    };
  }

  const insforge = createInsforgeServer();
  const { error } = await insforge.database.from("contact_requests").insert([
    {
      type: parsed.data.type,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
    },
  ]);

  if (error) {
    console.error("[createContactRequest]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  return {
    data: {
      success: true,
      message: "Your message was sent successfully.",
    },
    error: null,
  };
}

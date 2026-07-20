"use server";

import {
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createContactRequest as createContactRequestRequest } from "@/lib/api/contact-requests";
import { createContactRequestSchema } from "@/lib/validation/contact-requests";

export async function createContactRequest(input: {
  reason: "hire_services" | "seek_representation";
  email: string;
  message: string;
}): Promise<ActionResult<{ success: true; message: string }>> {
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

  try {
    const response = await createContactRequestRequest(parsed.data);
    return {
      data: { success: true, message: response.message },
      error: null,
    };
  } catch (error) {
    console.error("[createContactRequest]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }
}

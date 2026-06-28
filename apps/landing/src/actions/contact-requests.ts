"use server";

// Safe Action
import { actionClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";

// Validation Schema
import { createContactRequestSchema } from "@/lib/validation/contact-requests";

// API
import { createContactRequest as createContactRequestRequest } from "@/lib/api/contact-requests";

export const createContactRequest = actionClient
  .metadata({ actionName: "createContactRequest" })
  .inputSchema(createContactRequestSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput: data }) => {
    const response = await createContactRequestRequest(data);

    return {
      success: true,
      message: response.message,
    };
  });

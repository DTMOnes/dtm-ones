"use server";

// Safe Action
import { actionClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";

// Database
import { db } from "@/lib/db";

// Schema
import { contactRequest } from "@/lib/db/schema";

// Drizzle
import { eq } from "drizzle-orm";

// Validation Schema
import {
  createContactRequestSchema,
  getContactRequestSchema,
} from "@/lib/validation/contact-requests";

export const createContactRequest = actionClient
  .metadata({ actionName: "createContactRequest" })
  .inputSchema(createContactRequestSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput: data }) => {
    await db.insert(contactRequest).values(data);

    return {
      success: true,
      message: "Tu mensaje se envió correctamente.",
    };
  });
/*
export const deleteContactRequest = actionClient
  .metadata({ actionName: "deleteContactRequest" })
  .inputSchema(getContactRequestSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput: { id } }) => {
    const deleted = await db
      .delete(contactRequest)
      .where(eq(contactRequest.id, id))
      .returning({ id: contactRequest.id });

    if (deleted.length === 0) {
      return {
        success: false,
        message: "No se encontró la solicitud de contacto.",
      };
    }

    return {
      success: true,
      message: "Solicitud de contacto eliminada correctamente.",
    };
  });
*/

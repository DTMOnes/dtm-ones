"use server";

import { revalidatePath } from "next/cache";
import { flattenValidationErrors } from "next-safe-action";

import {
  ConflictActionError,
  NotFoundActionError,
  ServiceUnavailableActionError,
  normalizeCause,
  type ActionErrorContext,
} from "@/lib/action-errors";
import type {
  ContactDeleteSuccess,
  ContactMutationSuccess,
} from "@/lib/contacts/types";
import { createInsforgeServer } from "@/lib/insforge-server";
import { staffClient } from "@/lib/safe-action";
import {
  contactRequestIdSchema,
  parseContactRequest,
} from "@/lib/validation/contacts";
import type {
  ContactRequest,
  ContactRequestStatus,
} from "@/types/contact-request";

const CONTACT_COLUMNS =
  "id, type, email, phone, message, status, created_at, updated_at";

const CONTACTS_UNAVAILABLE_MESSAGE =
  "Contacts are temporarily unavailable. Please try again in a moment.";

async function loadContactById(
  id: string,
  context: ActionErrorContext,
): Promise<ContactRequest | null> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("contact_requests")
    .select(CONTACT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new ServiceUnavailableActionError({
      message: CONTACTS_UNAVAILABLE_MESSAGE,
      context,
      cause: normalizeCause(error),
    });
  }

  if (data === null) {
    return null;
  }

  const row = parseContactRequest(data);
  if (!row) {
    throw new ServiceUnavailableActionError({
      message: CONTACTS_UNAVAILABLE_MESSAGE,
      context,
      cause: new Error("A contact request row failed schema validation"),
    });
  }

  return row;
}

async function updateContactStatus(options: {
  actionName: string;
  id: string;
  fromStatuses: ContactRequestStatus[];
  toStatus: ContactRequestStatus;
}): Promise<ContactMutationSuccess> {
  const context: ActionErrorContext = {
    actionName: options.actionName,
    entityType: "contact_request",
    entityId: options.id,
  };

  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("contact_requests")
    .update({ status: options.toStatus })
    .eq("id", options.id)
    .in("status", options.fromStatuses)
    .select(CONTACT_COLUMNS);

  if (error) {
    throw new ServiceUnavailableActionError({
      message: CONTACTS_UNAVAILABLE_MESSAGE,
      context,
      cause: normalizeCause(error),
    });
  }

  const updated = Array.isArray(data)
    ? data.map((row) => parseContactRequest(row)).find((row) => row !== null)
    : null;

  if (updated) {
    revalidatePath("/contacts");
    return { ok: true, request: updated };
  }

  const existing = await loadContactById(options.id, context);

  if (!existing) {
    throw new NotFoundActionError({
      message: "This contact request is no longer available.",
      context,
    });
  }

  if (existing.status === options.toStatus) {
    return { ok: true, request: existing };
  }

  throw new ConflictActionError({
    message:
      "This contact request was updated elsewhere. Refresh and try again.",
    context,
  });
}

export const markContactReadAction = staffClient
  .metadata({ actionName: "markContactRead" })
  .inputSchema(contactRequestIdSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }): Promise<ContactMutationSuccess> => {
    return updateContactStatus({
      actionName: "markContactRead",
      id: parsedInput.id,
      fromStatuses: ["new"],
      toStatus: "read",
    });
  });

export const archiveContactAction = staffClient
  .metadata({ actionName: "archiveContact" })
  .inputSchema(contactRequestIdSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }): Promise<ContactMutationSuccess> => {
    return updateContactStatus({
      actionName: "archiveContact",
      id: parsedInput.id,
      fromStatuses: ["new", "read"],
      toStatus: "archived",
    });
  });

export const unarchiveContactAction = staffClient
  .metadata({ actionName: "unarchiveContact" })
  .inputSchema(contactRequestIdSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }): Promise<ContactMutationSuccess> => {
    return updateContactStatus({
      actionName: "unarchiveContact",
      id: parsedInput.id,
      fromStatuses: ["archived"],
      toStatus: "read",
    });
  });

export const deleteContactAction = staffClient
  .metadata({ actionName: "deleteContact" })
  .inputSchema(contactRequestIdSchema, {
    handleValidationErrorsShape: async (errors) => {
      return flattenValidationErrors(errors).fieldErrors;
    },
  })
  .action(async ({ parsedInput }): Promise<ContactDeleteSuccess> => {
    const context: ActionErrorContext = {
      actionName: "deleteContact",
      entityType: "contact_request",
      entityId: parsedInput.id,
    };

    const insforge = await createInsforgeServer();
    const { data, error } = await insforge.database
      .from("contact_requests")
      .delete()
      .eq("id", parsedInput.id)
      .select("id");

    if (error) {
      throw new ServiceUnavailableActionError({
        message: CONTACTS_UNAVAILABLE_MESSAGE,
        context,
        cause: normalizeCause(error),
      });
    }

    const deletedCount = Array.isArray(data) ? data.length : 0;
    if (deletedCount === 0) {
      throw new NotFoundActionError({
        message: "This contact request is no longer available.",
        context,
      });
    }

    revalidatePath("/contacts");
    return { ok: true };
  });

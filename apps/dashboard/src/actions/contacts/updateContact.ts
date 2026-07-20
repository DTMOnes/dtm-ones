import { revalidatePath } from "next/cache";

import { findContactById } from "@/actions/contacts/findContactById";
import {
  CONFLICT,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import { parseContactRequest } from "@/lib/validation/contacts";
import type {
  ContactRequest,
  ContactRequestStatus,
} from "@/types/contact-request";

const CONTACT_COLUMNS =
  "id, type, email, phone, message, status, created_at, updated_at";

export async function updateContact(options: {
  actionName: string;
  id: string;
  fromStatuses: ContactRequestStatus[];
  toStatus: ContactRequestStatus;
}): Promise<ActionResult<{ request: ContactRequest }>> {
  const { actionName, id, fromStatuses, toStatus } = options;

  const existingResult = await findContactById(id, actionName);
  if (existingResult.error) {
    return existingResult;
  }

  const existing = existingResult.data;

  if (existing.status === toStatus) {
    return { data: { request: existing }, error: null };
  }

  if (!fromStatuses.includes(existing.status)) {
    return { data: null, error: { message: CONFLICT } };
  }

  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("contact_requests")
    .update({ status: toStatus })
    .eq("id", id)
    .in("status", fromStatuses)
    .select(CONTACT_COLUMNS);

  if (error) {
    console.error(`[${actionName}]`, error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  const updated = Array.isArray(data)
    ? data.map((row) => parseContactRequest(row)).find((row) => row !== null)
    : null;

  if (updated) {
    revalidatePath("/contacts");
    return { data: { request: updated }, error: null };
  }

  const afterRaceResult = await findContactById(id, actionName);
  if (afterRaceResult.error) {
    return afterRaceResult;
  }

  if (afterRaceResult.data.status === toStatus) {
    return { data: { request: afterRaceResult.data }, error: null };
  }

  return { data: null, error: { message: CONFLICT } };
}

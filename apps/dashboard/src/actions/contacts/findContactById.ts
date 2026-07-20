import {
  NOT_FOUND,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import { parseContactRequest } from "@/lib/validation/contacts";
import type { ContactRequest } from "@/types/contact-request";

const CONTACT_COLUMNS =
  "id, type, email, phone, message, status, created_at, updated_at";

export async function findContactById(
  id: string,
  actionName: string,
): Promise<ActionResult<ContactRequest>> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("contact_requests")
    .select(CONTACT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`[${actionName}]`, error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (data === null) {
    return { data: null, error: { message: NOT_FOUND } };
  }

  const row = parseContactRequest(data);
  if (!row) {
    console.error(`[${actionName}]`, "invalid contact_requests row shape");
    return { data: null, error: { message: UNAVAILABLE } };
  }

  return { data: row, error: null };
}

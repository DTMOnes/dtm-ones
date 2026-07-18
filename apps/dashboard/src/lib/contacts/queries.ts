import { createInsforgeServer } from "@/lib/insforge-server";
import { parseContactRequests } from "@/lib/validation/contacts";
import type { ContactRequest } from "@/types/contact-request";

const CONTACT_COLUMNS =
  "id, type, email, phone, message, status, created_at, updated_at";

export async function listContactRequests(): Promise<ContactRequest[]> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("contact_requests")
    .select(CONTACT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[contacts/queries/list]", error);
    throw new Error("Failed to load contact requests");
  }

  return parseContactRequests(data ?? []);
}

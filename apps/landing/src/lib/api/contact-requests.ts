// Types
import type { CreateContactRequest } from "@/lib/validation/contact-requests";

// API
import { apiFetch } from "@/lib/api/client";

type MessageResponse = {
  message: string;
};

export function createContactRequest(
  payload: CreateContactRequest,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/contact-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

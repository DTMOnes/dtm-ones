import { apiFetch } from "@/lib/api/client";
import type { ApiContactRequest, ApiMessageResponse } from "@/lib/api/types";

export async function getContactRequests() {
  return apiFetch<ApiContactRequest[]>("/contact-requests");
}

export async function deleteContactRequest(requestId: string) {
  return apiFetch<ApiMessageResponse>(`/contact-requests/${requestId}`, {
    method: "DELETE",
  });
}

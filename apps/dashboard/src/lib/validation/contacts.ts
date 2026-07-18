import { z } from "zod";

import type {
  ContactRequest,
  ContactRequestStatus,
  ContactRequestType,
} from "@/types/contact-request";

export const contactRequestIdSchema = z.object({
  id: z.uuid("Invalid contact request id."),
});

export type ContactRequestIdInput = z.infer<typeof contactRequestIdSchema>;

export const contactRequestTypeSchema = z.enum(["player", "recruiter"]);
export const contactRequestStatusSchema = z.enum(["new", "read", "archived"]);

export const contactRequestSchema = z.object({
  id: z.uuid(),
  type: contactRequestTypeSchema,
  email: z.string().min(1),
  phone: z.string().min(1),
  message: z.string().min(1),
  status: contactRequestStatusSchema,
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

export function parseContactRequest(value: unknown): ContactRequest | null {
  const parsed = contactRequestSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

export function parseContactRequests(value: unknown): ContactRequest[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const rows: ContactRequest[] = [];
  for (const item of value) {
    const row = parseContactRequest(item);
    if (row) {
      rows.push(row);
    }
  }
  return rows;
}

export function isContactRequestStatus(
  value: string,
): value is ContactRequestStatus {
  return (
    value === "new" || value === "read" || value === "archived"
  );
}

export function isContactRequestType(value: string): value is ContactRequestType {
  return value === "player" || value === "recruiter";
}

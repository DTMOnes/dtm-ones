import type {
  ContactRequestReason,
  ContactRequestStatus,
} from "@/types/contact-request";

export function contactRequestReasonLabel(
  reason: ContactRequestReason,
): string {
  if (reason === "seeking_representation") {
    return "Seeking representation";
  }
  return "Looking for a player";
}

/** "First Last", or null for messages sent before the form asked for a name. */
export function contactRequestName(request: {
  firstName: string | null;
  lastName: string | null;
}): string | null {
  const name = [request.firstName, request.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  return name || null;
}

export function contactRequestStatusLabel(
  status: ContactRequestStatus,
): string {
  if (status === "new") {
    return "New";
  }
  if (status === "read") {
    return "Read";
  }
  return "Archived";
}

export function formatContactRequestDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function contactRequestMessagePreview(message: string): string {
  if (message.length <= 140) {
    return message;
  }
  return `${message.slice(0, 140).trimEnd()}…`;
}

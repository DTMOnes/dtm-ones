import type {
  ContactRequestStatus,
  ContactRequestType,
} from "@/types/contact-request";

export function contactTypeLabel(type: ContactRequestType): string {
  return type === "player" ? "Player" : "Recruiter";
}

export function contactStatusLabel(status: ContactRequestStatus): string {
  if (status === "new") return "New";
  if (status === "read") return "Read";
  return "Archived";
}

export function formatContactDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function messagePreview(message: string, maxLength = 140): string {
  const normalized = message.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}...`;
}

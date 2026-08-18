import type {
  ContactRequest,
  ContactRequestStatus,
  ContactsInboxFilter,
} from "@/types/contact-request";

export const FILTER_OPTIONS: {
  value: ContactsInboxFilter;
  label: string;
}[] = [
  { value: "active", label: "Active" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

const STATUS_RANK: Record<ContactRequestStatus, number> = {
  new: 0,
  read: 1,
  archived: 2,
};

export function isContactsInboxFilter(
  value: string,
): value is ContactsInboxFilter {
  return FILTER_OPTIONS.some((option) => option.value === value);
}

export function matchesInboxFilter(
  status: ContactRequestStatus,
  filter: ContactsInboxFilter,
): boolean {
  if (filter === "active") {
    return status === "new" || status === "read";
  }

  return status === filter;
}

export function inboxFilterCounts(
  requests: Pick<ContactRequest, "status">[],
): Record<ContactsInboxFilter, number> {
  const counts: Record<ContactsInboxFilter, number> = {
    active: 0,
    new: 0,
    read: 0,
    archived: 0,
  };

  for (const request of requests) {
    counts[request.status] += 1;

    if (request.status === "new" || request.status === "read") {
      counts.active += 1;
    }
  }

  return counts;
}

export function visibleInboxRequests(
  requests: ContactRequest[],
  filter: ContactsInboxFilter,
): ContactRequest[] {
  return requests
    .filter((request) => matchesInboxFilter(request.status, filter))
    .sort((a, b) => {
      const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];

      if (rank !== 0) {
        return rank;
      }

      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
}

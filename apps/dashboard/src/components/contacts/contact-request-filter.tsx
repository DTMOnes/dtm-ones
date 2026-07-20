"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ContactsInboxFilter } from "@/types/contact-request";

type ContactRequestFilterProps = {
  value: ContactsInboxFilter;
  onChange: (value: ContactsInboxFilter) => void;
};

export const FILTER_OPTIONS: {
  value: ContactsInboxFilter;
  label: string;
}[] = [
  { value: "active", label: "Active" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

export function isContactsInboxFilter(
  value: string,
): value is ContactsInboxFilter {
  return FILTER_OPTIONS.some((option) => option.value === value);
}

export function ContactRequestFilter({
  value,
  onChange,
}: ContactRequestFilterProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (isContactsInboxFilter(next)) {
          onChange(next);
        }
      }}
      variant="outline"
      size="sm"
      spacing={0}
      aria-label="Filter contact requests"
    >
      {FILTER_OPTIONS.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

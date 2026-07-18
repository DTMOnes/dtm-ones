"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ContactsInboxFilter } from "@/types/contact-request";

type ContactRequestFilterProps = {
  value: ContactsInboxFilter;
  onChange: (value: ContactsInboxFilter) => void;
};

const FILTER_OPTIONS: { value: ContactsInboxFilter; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

export function ContactRequestFilter({
  value,
  onChange,
}: ContactRequestFilterProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (
          next === "active" ||
          next === "new" ||
          next === "read" ||
          next === "archived"
        ) {
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

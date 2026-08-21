"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ContactsInboxFilter } from "@/types/contact-request";
import {
  FILTER_OPTIONS,
  isContactsInboxFilter,
} from "@/utils/contacts-inbox";

type ContactRequestFilterProps = {
  value: ContactsInboxFilter;
  counts: Record<ContactsInboxFilter, number>;
  onChange: (value: ContactsInboxFilter) => void;
};

export function ContactRequestFilter({
  value,
  counts,
  onChange,
}: ContactRequestFilterProps) {
  return (
    <Tabs
      value={value}
      className="w-full min-w-0"
      onValueChange={(next) => {
        if (isContactsInboxFilter(next)) {
          onChange(next);
        }
      }}
    >
      <TabsList
        variant="line"
        aria-label="Filter inbox"
        className="w-full overflow-x-auto"
      >
        {FILTER_OPTIONS.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
            <span className="text-muted-foreground text-xs font-medium tabular-nums">
              {counts[option.value]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

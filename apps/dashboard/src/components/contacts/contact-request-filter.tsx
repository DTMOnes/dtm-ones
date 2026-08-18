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
      className="min-w-0"
      onValueChange={(next) => {
        if (isContactsInboxFilter(next)) {
          onChange(next);
        }
      }}
    >
      <TabsList
        variant="line"
        aria-label="Filter contact requests"
        className="h-8 w-full max-w-full justify-start overflow-x-auto rounded-none border-b border-border p-0"
      >
        {FILTER_OPTIONS.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className="flex-none px-2.5 first:pl-0 group-data-horizontal/tabs:after:bottom-[-1px]"
          >
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

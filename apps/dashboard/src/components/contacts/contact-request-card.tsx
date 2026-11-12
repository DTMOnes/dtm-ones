"use client";

import { EnvelopeSimpleIcon } from "@phosphor-icons/react";

import { ListRowChevron, ListRowMeta } from "@/components/page/page-frame";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import type { ContactRequest } from "@/types/contact-request";
import {
  contactRequestMessagePreview,
  contactRequestName,
  contactRequestReasonLabel,
  contactRequestStatusLabel,
  formatContactRequestDate,
} from "@/utils/contact-request-labels";

type ContactRequestCardProps = {
  request: ContactRequest;
  onOpen: (request: ContactRequest) => void;
};

export function ContactRequestCard({
  request,
  onOpen,
}: ContactRequestCardProps) {
  const isNew = request.status === "new";
  const name = contactRequestName(request);

  return (
    <Item
      variant="muted"
      role="button"
      tabIndex={0}
      aria-label={`${contactRequestStatusLabel(request.status)}: ${name ?? request.email}`}
      onClick={() => onOpen(request)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(request);
        }
      }}
      className={cn("cursor-pointer", !isNew && "opacity-60 hover:opacity-80")}
    >
      <ItemMedia variant="icon" className="relative">
        <EnvelopeSimpleIcon />
        {isNew ? (
          // Unread marker; the row's aria-label already announces the status.
          <span
            aria-hidden
            className="bg-destructive ring-card absolute -top-1 -right-1 size-2.5 rounded-full ring-2"
          />
        ) : null}
      </ItemMedia>
      <ItemContent>
        <ItemTitle
          className={isNew ? undefined : "font-normal text-muted-foreground"}
        >
          {name ?? request.email}
        </ItemTitle>
        <ItemDescription>
          {name ? `${request.email} · ` : null}
          {formatContactRequestDate(request.createdAt)}
          {request.message
            ? ` - ${contactRequestMessagePreview(request.message)}`
            : null}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <ListRowMeta>{contactRequestReasonLabel(request.reason)}</ListRowMeta>
        <ListRowChevron />
      </ItemActions>
    </Item>
  );
}

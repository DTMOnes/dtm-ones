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

  return (
    <Item
      variant="muted"
      role="button"
      tabIndex={0}
      aria-label={`${contactRequestStatusLabel(request.status)}: ${request.email}`}
      onClick={() => onOpen(request)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(request);
        }
      }}
      className={cn("cursor-pointer", !isNew && "opacity-60 hover:opacity-80")}
    >
      <ItemMedia variant="icon">
        <EnvelopeSimpleIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle
          className={isNew ? undefined : "font-normal text-muted-foreground"}
        >
          {request.email}
        </ItemTitle>
        <ItemDescription>
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

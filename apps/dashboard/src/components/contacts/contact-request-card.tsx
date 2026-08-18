"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactRequestField } from "@/components/contacts/contact-request-field";
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
    <Card
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
      className={cn(
        "cursor-pointer gap-6 rounded-lg transition-[opacity,background-color,box-shadow] hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        isNew
          ? "shadow-sm"
          : "shadow-none opacity-60 hover:opacity-80",
      )}
    >
      <CardHeader>
        <Badge variant="secondary">
          {contactRequestReasonLabel(request.reason)}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ContactRequestField label="Email">
          <CardTitle
            className={
              isNew ? "truncate" : "truncate font-normal text-muted-foreground"
            }
          >
            {request.email}
          </CardTitle>
        </ContactRequestField>
        <ContactRequestField label="Phone">
          <CardDescription className="truncate">
            {request.phone}
          </CardDescription>
        </ContactRequestField>
        <ContactRequestField label="Message">
          <p className="text-muted-foreground line-clamp-3 text-sm">
            {contactRequestMessagePreview(request.message)}
          </p>
        </ContactRequestField>
      </CardContent>
      <CardFooter className="rounded-b-lg">
        <ContactRequestField label="Received">
          <p className="text-sm">{formatContactRequestDate(request.createdAt)}</p>
        </ContactRequestField>
      </CardFooter>
    </Card>
  );
}

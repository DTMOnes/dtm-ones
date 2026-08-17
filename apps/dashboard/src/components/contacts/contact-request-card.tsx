"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  return (
    <Card
      size="sm"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(request)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(request);
        }
      }}
      className="cursor-pointer transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {contactRequestReasonLabel(request.reason)}
          </Badge>
          <Badge variant={request.status === "new" ? "default" : "outline"}>
            {contactRequestStatusLabel(request.status)}
          </Badge>
        </div>
        <CardTitle className="truncate">{request.email}</CardTitle>
        <CardDescription>{request.phone}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-muted-foreground line-clamp-3 text-sm">
          {contactRequestMessagePreview(request.message)}
        </p>
        <p className="text-muted-foreground text-xs">
          {formatContactRequestDate(request.createdAt)}
        </p>
      </CardContent>
    </Card>
  );
}

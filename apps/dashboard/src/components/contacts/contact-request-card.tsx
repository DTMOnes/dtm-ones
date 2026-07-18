"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  contactStatusLabel,
  contactTypeLabel,
  formatContactDate,
  messagePreview,
} from "@/lib/contacts/format";
import type { ContactRequest } from "@/types/contact-request";

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
          <Badge variant="secondary">{contactTypeLabel(request.type)}</Badge>
          <Badge variant={request.status === "new" ? "default" : "outline"}>
            {contactStatusLabel(request.status)}
          </Badge>
        </div>
        <CardTitle className="truncate">{request.email}</CardTitle>
        <CardDescription>{request.phone}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-muted-foreground line-clamp-3 text-sm">
          {messagePreview(request.message)}
        </p>
        <p className="text-muted-foreground text-xs">
          {formatContactDate(request.created_at)}
        </p>
      </CardContent>
    </Card>
  );
}

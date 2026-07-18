"use client";

import { useState } from "react";
import { CopyIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { ArchiveContactRequestButton } from "@/components/contacts/archive-contact-request-button";
import { DeleteContactRequestButton } from "@/components/contacts/delete-contact-request-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  contactStatusLabel,
  contactTypeLabel,
  formatContactDate,
} from "@/lib/contacts/format";
import type { ContactRequest } from "@/types/contact-request";

type ContactRequestDialogProps = {
  request: ContactRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

async function copyText(label: string, value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch (error) {
    console.error("[ContactRequestDialog/copy]", error);
    toast.error(`Could not copy ${label.toLowerCase()}`);
  }
}

export function ContactRequestDialog({
  request,
  open,
  onOpenChange,
}: ContactRequestDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  if (!request) {
    return null;
  }

  const isBusy = isArchiving || isDeleting;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isBusy) {
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{contactTypeLabel(request.type)}</Badge>
            <Badge variant={request.status === "new" ? "default" : "outline"}>
              {contactStatusLabel(request.status)}
            </Badge>
          </div>
          <DialogTitle>Contact request</DialogTitle>
          <DialogDescription>
            Received {formatContactDate(request.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Email
            </p>
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-sm">{request.email}</p>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Copy email"
                disabled={isBusy}
                onClick={() => void copyText("Email", request.email)}
              >
                <CopyIcon />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Phone
            </p>
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-sm">{request.phone}</p>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Copy phone"
                disabled={isBusy}
                onClick={() => void copyText("Phone", request.phone)}
              >
                <CopyIcon />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Message
            </p>
            <p className="text-sm whitespace-pre-wrap">{request.message}</p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <DeleteContactRequestButton
            id={request.id}
            disabled={isArchiving}
            onPendingChange={setIsDeleting}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <ArchiveContactRequestButton
              id={request.id}
              status={request.status}
              disabled={isDeleting}
              onPendingChange={setIsArchiving}
              onSuccess={() => {
                onOpenChange(false);
              }}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

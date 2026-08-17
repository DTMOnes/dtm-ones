"use client";

import { useRouter } from "next/navigation";
import { CopyIcon } from "@phosphor-icons/react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { archiveContactRequestAction } from "@/actions/contacts/archiveContactRequest";
import { deleteContactRequestAction } from "@/actions/contacts/deleteContactRequest";
import { unarchiveContactRequestAction } from "@/actions/contacts/unarchiveContactRequest";
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
import type { ContactRequest } from "@/types/contact-request";
import {
  contactRequestReasonLabel,
  contactRequestStatusLabel,
  formatContactRequestDate,
} from "@/utils/contact-request-labels";

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
  const router = useRouter();

  const { executeAsync: archive, isExecuting: isArchiving } = useAction(
    archiveContactRequestAction,
    {
      onSuccess: () => {
        toast.success("Contact request archived");
        onOpenChange(false);
        router.refresh();
      },
      onError: ({ error }) => {
        if (error.serverError) {
          toast.error(error.serverError.message);
        }
      },
    },
  );

  const { executeAsync: unarchive, isExecuting: isUnarchiving } = useAction(
    unarchiveContactRequestAction,
    {
      onSuccess: () => {
        toast.success("Contact request moved back to Read");
        onOpenChange(false);
        router.refresh();
      },
      onError: ({ error }) => {
        if (error.serverError) {
          toast.error(error.serverError.message);
        }
      },
    },
  );

  const { executeAsync: remove, isExecuting: isDeleting } = useAction(
    deleteContactRequestAction,
    {
      onSuccess: () => {
        toast.success("Contact request deleted");
        onOpenChange(false);
        router.refresh();
      },
      onError: ({ error }) => {
        if (error.serverError) {
          toast.error(error.serverError.message);
        }
      },
    },
  );

  const isBusy = isArchiving || isUnarchiving || isDeleting;

  if (!request) {
    return null;
  }

  function handleOpenChange(nextOpen: boolean): void {
    if (!nextOpen && isBusy) {
      return;
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {contactRequestReasonLabel(request.reason)}
            </Badge>
            <Badge variant={request.status === "new" ? "default" : "outline"}>
              {contactRequestStatusLabel(request.status)}
            </Badge>
          </div>
          <DialogTitle>Contact request</DialogTitle>
          <DialogDescription>
            Received {formatContactRequestDate(request.createdAt)}
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
            pending={isDeleting}
            disabled={isArchiving || isUnarchiving}
            onDelete={async () => {
              const result = await remove({ id: request.id });
              return result?.data?.ok === true;
            }}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <ArchiveContactRequestButton
              status={request.status}
              pending={isArchiving || isUnarchiving}
              disabled={isDeleting}
              onArchive={() => {
                void archive({ id: request.id });
              }}
              onUnarchive={() => {
                void unarchive({ id: request.id });
              }}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

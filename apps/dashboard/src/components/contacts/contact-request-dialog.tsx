"use client";

import { useRouter } from "next/navigation";
import { CopyIcon } from "@phosphor-icons/react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { archiveContactRequestAction } from "@/actions/contacts/archiveContactRequest";
import { deleteContactRequestAction } from "@/actions/contacts/deleteContactRequest";
import { unarchiveContactRequestAction } from "@/actions/contacts/unarchiveContactRequest";
import { ArchiveContactRequestButton } from "@/components/contacts/archive-contact-request-button";
import { ContactRequestField } from "@/components/contacts/contact-request-field";
import { DeleteContactRequestButton } from "@/components/contacts/delete-contact-request-button";
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
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}`);
  }
}

function CopyValueButton({
  label,
  value,
  disabled,
}: {
  label: string;
  value: string;
  disabled: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Copy ${label.toLowerCase()}`}
      disabled={disabled}
      onClick={() => void copyText(label, value)}
    >
      <CopyIcon />
    </Button>
  );
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

  const reasonLabel = contactRequestReasonLabel(request.reason);

  function handleOpenChange(nextOpen: boolean): void {
    if (!nextOpen && isBusy) {
      return;
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-busy={isBusy}
        showCloseButton={!isBusy}
        className="flex max-h-[min(90dvh,40rem)] flex-col gap-6 overflow-hidden p-5 sm:max-w-lg"
      >
        <DialogHeader className="w-full shrink-0 gap-6">
          <DialogDescription className="sr-only">
            {reasonLabel} contact request
          </DialogDescription>
          <div className="flex w-full flex-col gap-4">
            <ContactRequestField label="Reason" className="w-full">
              <p className="text-sm">{reasonLabel}</p>
            </ContactRequestField>
            <ContactRequestField label="Email" className="w-full">
              <div className="flex w-full min-w-0 items-center justify-between gap-1">
                <DialogTitle className="min-w-0 flex-1 truncate">
                  {request.email}
                </DialogTitle>
                <CopyValueButton
                  label="Email"
                  value={request.email}
                  disabled={isBusy}
                />
              </div>
            </ContactRequestField>
            <ContactRequestField label="Phone" className="w-full">
              <div className="flex w-full min-w-0 items-center justify-between gap-1">
                <p className="min-w-0 flex-1 truncate text-sm">
                  {request.phone}
                </p>
                <CopyValueButton
                  label="Phone"
                  value={request.phone}
                  disabled={isBusy}
                />
              </div>
            </ContactRequestField>
          </div>
        </DialogHeader>

        <ContactRequestField label="Message" className="min-h-0 overflow-hidden">
          <div
            tabIndex={0}
            aria-label="Message"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <p className="text-sm whitespace-pre-wrap">{request.message}</p>
          </div>
        </ContactRequestField>

        <DialogFooter className="-mx-5 -mb-5 flex-col p-5 sm:justify-between">
          <ContactRequestField label="Received">
            <p className="text-sm">
              {formatContactRequestDate(request.createdAt)}
            </p>
          </ContactRequestField>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            <DeleteContactRequestButton
              pending={isDeleting}
              disabled={isArchiving || isUnarchiving}
              onDelete={async () => {
                const result = await remove({ id: request.id });
                return result?.data?.ok === true;
              }}
            />
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

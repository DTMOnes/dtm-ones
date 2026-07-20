"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { archiveContactAction } from "@/actions/contacts/archiveContact";
import { deleteContactAction } from "@/actions/contacts/deleteContact";
import { unarchiveContactAction } from "@/actions/contacts/unarchiveContact";
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

type MutationPending = "archive" | "delete" | null;

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
  const [pending, setPending] = useState<MutationPending>(null);

  if (!request) {
    return null;
  }

  const activeRequest = request;
  const isBusy = pending !== null;
  const isArchiving = pending === "archive";
  const isDeleting = pending === "delete";

  function handleOpenChange(nextOpen: boolean): void {
    if (!nextOpen && isBusy) {
      return;
    }

    if (!nextOpen) {
      setPending(null);
    }

    onOpenChange(nextOpen);
  }

  async function runStatusAction(
    mode: "archive" | "unarchive",
  ): Promise<void> {
    setPending("archive");

    try {
      const { error } =
        mode === "archive"
          ? await archiveContactAction({ id: activeRequest.id })
          : await unarchiveContactAction({ id: activeRequest.id });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        mode === "archive"
          ? "Contact request archived"
          : "Contact request moved back to Read",
      );
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error(`[ContactRequestDialog/${mode}]`, error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(null);
    }
  }

  async function runDelete(): Promise<boolean> {
    setPending("delete");

    try {
      const { error } = await deleteContactAction({ id: activeRequest.id });

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success("Contact request deleted");
      onOpenChange(false);
      router.refresh();
      return true;
    } catch (error) {
      console.error("[ContactRequestDialog/delete]", error);
      toast.error("Something went wrong. Please try again.");
      return false;
    } finally {
      setPending(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {contactTypeLabel(activeRequest.type)}
            </Badge>
            <Badge
              variant={activeRequest.status === "new" ? "default" : "outline"}
            >
              {contactStatusLabel(activeRequest.status)}
            </Badge>
          </div>
          <DialogTitle>Contact request</DialogTitle>
          <DialogDescription>
            Received {formatContactDate(activeRequest.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Email
            </p>
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-sm">
                {activeRequest.email}
              </p>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Copy email"
                disabled={isBusy}
                onClick={() => void copyText("Email", activeRequest.email)}
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
              <p className="min-w-0 flex-1 truncate text-sm">
                {activeRequest.phone}
              </p>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Copy phone"
                disabled={isBusy}
                onClick={() => void copyText("Phone", activeRequest.phone)}
              >
                <CopyIcon />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Message
            </p>
            <p className="text-sm whitespace-pre-wrap">
              {activeRequest.message}
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <DeleteContactRequestButton
            pending={isDeleting}
            disabled={isArchiving}
            onDelete={runDelete}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <ArchiveContactRequestButton
              status={activeRequest.status}
              pending={isArchiving}
              disabled={isDeleting}
              onArchive={() => {
                void runStatusAction("archive");
              }}
              onUnarchive={() => {
                void runStatusAction("unarchive");
              }}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

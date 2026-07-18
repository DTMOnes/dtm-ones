"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  archiveContactAction,
  unarchiveContactAction,
} from "@/actions/contacts";
import { Button } from "@/components/ui/button";
import type { ContactRequestStatus } from "@/types/contact-request";

const FALLBACK_ERROR_MESSAGE =
  "The contact request could not be validated. Please try again.";

type ArchiveContactRequestButtonProps = {
  id: string;
  status: ContactRequestStatus;
  onSuccess: () => void;
  disabled?: boolean;
  onPendingChange?: (pending: boolean) => void;
};

export function ArchiveContactRequestButton({
  id,
  status,
  onSuccess,
  disabled = false,
  onPendingChange,
}: ArchiveContactRequestButtonProps) {
  const router = useRouter();
  const isArchived = status === "archived";

  const archive = useAction(archiveContactAction, {
    onSuccess: ({ data }) => {
      if (!data) return;

      toast.success("Contact request archived");
      onSuccess();
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message ?? FALLBACK_ERROR_MESSAGE);
    },
  });

  const unarchive = useAction(unarchiveContactAction, {
    onSuccess: ({ data }) => {
      if (!data) return;

      toast.success("Contact request moved back to Read");
      onSuccess();
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message ?? FALLBACK_ERROR_MESSAGE);
    },
  });

  const isPending = archive.isPending || unarchive.isPending;
  const isDisabled = disabled || isPending;

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  if (isArchived) {
    return (
      <Button
        type="button"
        variant="outline"
        disabled={isDisabled}
        onClick={() => {
          unarchive.execute({ id });
        }}
      >
        {unarchive.isPending ? "Unarchiving..." : "Unarchive"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isDisabled}
      onClick={() => {
        archive.execute({ id });
      }}
    >
      {archive.isPending ? "Archiving..." : "Archive"}
    </Button>
  );
}

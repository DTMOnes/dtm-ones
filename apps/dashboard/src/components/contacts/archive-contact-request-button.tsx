"use client";

import { Button } from "@/components/ui/button";
import type { ContactRequestStatus } from "@/types/contact-request";

type ArchiveContactRequestButtonProps = {
  status: ContactRequestStatus;
  pending: boolean;
  disabled?: boolean;
  onArchive: () => void;
  onUnarchive: () => void;
};

export function ArchiveContactRequestButton({
  status,
  pending,
  disabled = false,
  onArchive,
  onUnarchive,
}: ArchiveContactRequestButtonProps) {
  const isArchived = status === "archived";
  const isDisabled = disabled || pending;

  if (isArchived) {
    return (
      <Button
        type="button"
        disabled={isDisabled}
        onClick={onUnarchive}
      >
        {pending ? "Unarchiving..." : "Unarchive"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      disabled={isDisabled}
      onClick={onArchive}
    >
      {pending ? "Archiving..." : "Archive"}
    </Button>
  );
}

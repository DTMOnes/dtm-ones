"use client";

import { TrashIcon } from "@phosphor-icons/react";

import { PageErrorState } from "@/components/page/page-error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageErrorState
      title="Trash"
      description="Removed Players and Coaches."
      icon={TrashIcon}
      errorTitle="Could not load the Trash"
      errorDescription="Something went wrong while loading the Trash. Try again in a moment."
      reset={reset}
    />
  );
}

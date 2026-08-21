"use client";

import { UserIcon } from "@phosphor-icons/react";

import { PageErrorState } from "@/components/page/page-error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageErrorState
      title="Players"
      description="Players the agency represents."
      icon={UserIcon}
      errorTitle="Could not load players"
      errorDescription="Something went wrong while loading players. Try again in a moment."
      reset={reset}
    />
  );
}

"use client";

import { StrategyIcon } from "@phosphor-icons/react";

import { PageErrorState } from "@/components/page/page-error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageErrorState
      title="Coaches"
      description="Coaches the agency represents."
      icon={StrategyIcon}
      errorTitle="Could not load coaches"
      errorDescription="Something went wrong while loading coaches. Try again in a moment."
      reset={reset}
    />
  );
}

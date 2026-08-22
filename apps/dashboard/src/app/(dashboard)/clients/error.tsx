"use client";

import { UsersIcon } from "@phosphor-icons/react";

import { PageErrorState } from "@/components/page/page-error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageErrorState
      title="Clients"
      description="Players and Coaches the agency represents."
      icon={UsersIcon}
      errorTitle="Could not load Clients"
      errorDescription="Something went wrong while loading Clients. Try again in a moment."
      reset={reset}
    />
  );
}

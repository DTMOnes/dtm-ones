"use client";

import { EnvelopeSimpleIcon } from "@phosphor-icons/react";

import { PageErrorState } from "@/components/page/page-error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageErrorState
      title="Inbox"
      description="Messages submitted from the public contact form."
      icon={EnvelopeSimpleIcon}
      errorTitle="Could not load the inbox"
      errorDescription="Something went wrong while loading contact requests. Try again in a moment."
      reset={reset}
    />
  );
}

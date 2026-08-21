"use client";

import { TagSimpleIcon } from "@phosphor-icons/react";

import { PageErrorState } from "@/components/page/page-error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageErrorState
      title="Categories"
      description="Court positions for Players."
      icon={TagSimpleIcon}
      errorTitle="Could not load categories"
      errorDescription="Something went wrong while loading categories. Try again in a moment."
      reset={reset}
    />
  );
}

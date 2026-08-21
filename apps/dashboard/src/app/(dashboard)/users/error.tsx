"use client";

import { UserCircleIcon } from "@phosphor-icons/react";

import { PageErrorState } from "@/components/page/page-error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageErrorState
      title="Users"
      description="Owners and Staff who sign in."
      icon={UserCircleIcon}
      errorTitle="Could not load users"
      errorDescription="Something went wrong while loading users. Try again in a moment."
      reset={reset}
    />
  );
}

"use client";

import type { ReactNode } from "react";

import { useHeaderOverride } from "@/components/Header/HeaderProvider";
import GridLoading from "@/components/Grid/Loading";

/** Swaps the roster grid for a spinner while filter/search navigations are pending. */
export default function HomeRoster({ children }: { children: ReactNode }) {
  const { isRosterPending } = useHeaderOverride();

  if (isRosterPending) {
    return <GridLoading />;
  }

  return children;
}

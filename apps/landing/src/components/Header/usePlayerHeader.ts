"use client";

import { useEffect } from "react";

import { useHeaderOverride } from "@/components/Header/HeaderProvider";
import type { PlayerSectionId } from "@/components/Header/Filters/player-sections";

/**
 * Publishes player page header state (section tabs).
 * Clears on unmount so SiteHeader falls back to route defaults.
 */
export function usePlayerHeader(
  section: PlayerSectionId,
  onSectionChange: (id: PlayerSectionId) => void,
) {
  const { setOverride } = useHeaderOverride();

  useEffect(() => {
    setOverride({
      type: "player",
      section,
      onSectionChange,
    });
    return () => {
      setOverride(null);
    };
  }, [setOverride, section, onSectionChange]);
}

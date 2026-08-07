"use client";

import { useEffect } from "react";

import { useHeaderOverride } from "@/components/Header/HeaderProvider";
import type { PlayerSectionId } from "@/components/Header/Filters/player-sections";

/**
 * Publishes player page header state (name + section tabs).
 * Clears on unmount so SiteHeader falls back to route defaults.
 */
export function usePlayerHeader(
  playerName: string,
  section: PlayerSectionId,
  onSectionChange: (id: PlayerSectionId) => void,
) {
  const { setOverride, setPendingTitle } = useHeaderOverride();

  useEffect(() => {
    setPendingTitle(null);
    setOverride({
      type: "player",
      playerName,
      section,
      onSectionChange,
    });
    return () => {
      setOverride(null);
      setPendingTitle(null);
    };
  }, [setOverride, setPendingTitle, playerName, section, onSectionChange]);
}

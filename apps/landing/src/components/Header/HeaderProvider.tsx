"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { PlayerSectionId } from "@/components/Header/Filters/player-sections";

export type PlayerHeaderOverride = {
  type: "player";
  playerName: string;
  section: PlayerSectionId;
  onSectionChange: (id: PlayerSectionId) => void;
};

export type HeaderOverride = PlayerHeaderOverride;

type HeaderOverrideContextValue = {
  override: HeaderOverride | null;
  setOverride: (override: HeaderOverride | null) => void;
};

const HeaderOverrideContext = createContext<HeaderOverrideContextValue | null>(
  null,
);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [override, setOverrideState] = useState<HeaderOverride | null>(null);
  const setOverride = useCallback((next: HeaderOverride | null) => {
    setOverrideState(next);
  }, []);

  const value = useMemo(
    () => ({
      override,
      setOverride,
    }),
    [override, setOverride],
  );

  return (
    <HeaderOverrideContext.Provider value={value}>
      {children}
    </HeaderOverrideContext.Provider>
  );
}

export function useHeaderOverride() {
  const context = useContext(HeaderOverrideContext);
  if (!context) {
    throw new Error("useHeaderOverride must be used within HeaderProvider");
  }
  return context;
}

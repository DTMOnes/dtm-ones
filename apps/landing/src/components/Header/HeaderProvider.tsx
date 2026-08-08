"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react";

import type { FilterItem } from "@/components/Header/Filters";
import type { PlayerSectionId } from "@/components/Header/Filters/player-sections";

export type PlayerHeaderOverride = {
  type: "player";
  section: PlayerSectionId;
  onSectionChange: (id: PlayerSectionId) => void;
};

export type HeaderOverride = PlayerHeaderOverride;

type HeaderOverrideContextValue = {
  override: HeaderOverride | null;
  setOverride: (override: HeaderOverride | null) => void;
  /** Home category filter items; rendered inside the shared header shell. */
  categoryFilters: FilterItem[] | null;
  setCategoryFilters: (filters: FilterItem[] | null) => void;
  /** True while home search/filter navigations are pending. */
  isRosterPending: boolean;
  startRosterTransition: TransitionStartFunction;
};

const HeaderOverrideContext = createContext<HeaderOverrideContextValue | null>(
  null,
);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [override, setOverrideState] = useState<HeaderOverride | null>(null);
  const [categoryFilters, setCategoryFiltersState] = useState<
    FilterItem[] | null
  >(null);
  const [isRosterPending, startRosterTransition] = useTransition();

  const setOverride = useCallback((next: HeaderOverride | null) => {
    setOverrideState(next);
  }, []);

  const setCategoryFilters = useCallback((next: FilterItem[] | null) => {
    setCategoryFiltersState(next);
  }, []);

  const value = useMemo(
    () => ({
      override,
      setOverride,
      categoryFilters,
      setCategoryFilters,
      isRosterPending,
      startRosterTransition,
    }),
    [
      override,
      setOverride,
      categoryFilters,
      setCategoryFilters,
      isRosterPending,
      startRosterTransition,
    ],
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

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

type HeaderOverrideContextValue = {
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
  const [categoryFilters, setCategoryFiltersState] = useState<
    FilterItem[] | null
  >(null);
  const [isRosterPending, startRosterTransition] = useTransition();

  const setCategoryFilters = useCallback((next: FilterItem[] | null) => {
    setCategoryFiltersState(next);
  }, []);

  const value = useMemo(
    () => ({
      categoryFilters,
      setCategoryFilters,
      isRosterPending,
      startRosterTransition,
    }),
    [categoryFilters, setCategoryFilters, isRosterPending, startRosterTransition],
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

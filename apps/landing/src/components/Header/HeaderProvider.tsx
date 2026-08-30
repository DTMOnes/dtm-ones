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

export type ChromeOverlay = "none" | "menu" | "search";

type HeaderOverrideContextValue = {
  /** Home category filter items; rendered inside the shared header shell. */
  categoryFilters: FilterItem[] | null;
  setCategoryFilters: (filters: FilterItem[] | null) => void;
  /** True while home search/filter navigations are pending. */
  isRosterPending: boolean;
  startRosterTransition: TransitionStartFunction;
  /** At most one chrome overlay (nav menu or search/filter panel). */
  chromeOverlay: ChromeOverlay;
  openMenu: () => void;
  openSearchPanel: () => void;
  closeChromeOverlay: () => void;
  toggleMenu: () => void;
  toggleSearchPanel: () => void;
};

const HeaderOverrideContext = createContext<HeaderOverrideContextValue | null>(
  null,
);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [categoryFilters, setCategoryFiltersState] = useState<
    FilterItem[] | null
  >(null);
  const [isRosterPending, startRosterTransition] = useTransition();
  const [chromeOverlay, setChromeOverlay] = useState<ChromeOverlay>("none");

  const setCategoryFilters = useCallback((next: FilterItem[] | null) => {
    setCategoryFiltersState(next);
  }, []);

  const openMenu = useCallback(() => setChromeOverlay("menu"), []);
  const openSearchPanel = useCallback(() => setChromeOverlay("search"), []);
  const closeChromeOverlay = useCallback(() => setChromeOverlay("none"), []);
  const toggleMenu = useCallback(() => {
    setChromeOverlay((current) => (current === "menu" ? "none" : "menu"));
  }, []);
  const toggleSearchPanel = useCallback(() => {
    setChromeOverlay((current) => (current === "search" ? "none" : "search"));
  }, []);

  const value = useMemo(
    () => ({
      categoryFilters,
      setCategoryFilters,
      isRosterPending,
      startRosterTransition,
      chromeOverlay,
      openMenu,
      openSearchPanel,
      closeChromeOverlay,
      toggleMenu,
      toggleSearchPanel,
    }),
    [
      categoryFilters,
      setCategoryFilters,
      isRosterPending,
      startRosterTransition,
      chromeOverlay,
      openMenu,
      openSearchPanel,
      closeChromeOverlay,
      toggleMenu,
      toggleSearchPanel,
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

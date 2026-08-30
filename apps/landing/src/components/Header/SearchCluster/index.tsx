"use client";

import { useEffect, useId, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import Filters from "@/components/Header/Filters";
import Search from "@/components/Header/Search";
import { useHeaderOverride } from "@/components/Header/HeaderProvider";
import GlassControl from "@/components/GlassControl";
import { cn } from "@/lib/utils";
import {
  isDesktopFilterActive,
  isMobileSearchControlActive,
} from "@/utils/search-chrome-active";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function SearchCluster() {
  const panelId = useId();
  const clusterRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const {
    categoryFilters,
    chromeOverlay,
    toggleSearchPanel,
    closeChromeOverlay,
  } = useHeaderOverride();

  const open = chromeOverlay === "search";
  const q = searchParams.get("q");
  const c = searchParams.get("c");
  const kind = searchParams.get("kind");
  const desktopFilterActive = isDesktopFilterActive({ c, kind });
  const mobileControlActive = isMobileSearchControlActive({ q, c, kind });
  const hasFilters = categoryFilters !== null;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeChromeOverlay();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeChromeOverlay]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (clusterRef.current?.contains(target)) return;
      closeChromeOverlay();
    };

    // Capture so we close before other chrome handles the same tap.
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, closeChromeOverlay]);

  const filtersPanel =
    hasFilters && categoryFilters ? (
      <Filters
        items={categoryFilters}
        layout="wrap"
        onSelect={closeChromeOverlay}
      />
    ) : null;

  return (
    <div ref={clusterRef} className="relative w-full">
      {/* Desktop: search + filter button */}
      <div className="hidden items-center gap-2 lg:flex">
        <div className="min-w-0 flex-1">
          <Search />
        </div>
        {hasFilters ? (
          <GlassControl
            aria-label={open ? "Close filters" : "Open filters"}
            aria-expanded={open}
            aria-controls={panelId}
            active={desktopFilterActive}
            onClick={toggleSearchPanel}
          >
            <FunnelSimple className="size-5" weight="bold" aria-hidden />
          </GlassControl>
        ) : null}
      </div>

      {/* Mobile: one control for the whole search block */}
      <div className="flex justify-end lg:hidden">
        <GlassControl
          aria-label={open ? "Close search" : "Open search"}
          aria-expanded={open}
          aria-controls={panelId}
          active={mobileControlActive}
          onClick={toggleSearchPanel}
        >
          <MagnifyingGlass className="size-5" weight="bold" aria-hidden />
        </GlassControl>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            role="region"
            aria-label="Search and filters"
            className={cn(
              "glass-plate absolute top-full z-[1001] mt-3 p-3",
              // Desktop: cluster width. Phone: break out to header content width.
              "right-0 left-0 lg:left-0 lg:right-0",
              "max-lg:fixed max-lg:inset-x-7 max-lg:top-[76px] max-lg:right-7 max-lg:left-7",
            )}
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: easeOut }}
          >
            <div className="flex flex-col gap-3">
              <div className="lg:hidden">
                <Search autoFocus={open} />
              </div>
              {filtersPanel}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

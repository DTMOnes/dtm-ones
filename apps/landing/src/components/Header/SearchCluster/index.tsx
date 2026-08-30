"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import Filters from "@/components/Header/Filters";
import Search from "@/components/Header/Search";
import { useHeaderOverride } from "@/components/Header/HeaderProvider";
import { cn } from "@/lib/utils";
import {
  isDesktopFilterActive,
  isMobileSearchControlActive,
} from "@/utils/search-chrome-active";

const easeOut = [0.16, 1, 0.3, 1] as const;

function ControlButton({
  label,
  expanded,
  active,
  controls,
  onClick,
  children,
}: {
  label: string;
  expanded: boolean;
  active: boolean;
  controls: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border text-white outline-none transition-colors duration-200",
        "border-white/10 bg-[#1d1d1d] hover:border-white/20",
        "focus-visible:ring-2 focus-visible:ring-white/50",
        "active:scale-[0.98]",
        active && "border-white/35",
        expanded && "border-white/25",
      )}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onClick}
    >
      {children}
      {active ? (
        <span
          className="absolute top-2 right-2 size-1.5 rounded-full bg-white"
          aria-hidden
        />
      ) : null}
    </button>
  );
}

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
          <ControlButton
            label={open ? "Close filters" : "Open filters"}
            expanded={open}
            active={desktopFilterActive}
            controls={panelId}
            onClick={toggleSearchPanel}
          >
            <FunnelSimple className="size-5" weight="bold" aria-hidden />
          </ControlButton>
        ) : null}
      </div>

      {/* Mobile: one control for the whole search block */}
      <div className="flex justify-end lg:hidden">
        <ControlButton
          label={open ? "Close search" : "Open search"}
          expanded={open}
          active={mobileControlActive}
          controls={panelId}
          onClick={toggleSearchPanel}
        >
          <MagnifyingGlass className="size-5" weight="bold" aria-hidden />
        </ControlButton>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            role="region"
            aria-label="Search and filters"
            className={cn(
              "absolute top-full z-[1001] mt-3 border border-white/10 bg-[#1d1d1d] p-3 shadow-[0_18px_48px_rgb(0_0_0_/_0.45)]",
              // Desktop: cluster width. Phone: break out to header content width.
              "right-0 left-0 rounded-2xl lg:left-0 lg:right-0",
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

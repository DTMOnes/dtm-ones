"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { useHeaderOverride } from "@/components/Header/HeaderProvider";
import { COACHES_FILTER_ID } from "@/lib/roster/constants";
import { cn } from "@/lib/utils";

export type FilterItem = {
  id: string;
  name: string;
};

const easeOut = [0.16, 1, 0.3, 1] as const;

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.03, delayChildren: 0 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 6 },
  show: {
    y: 0,
    transition: { duration: 0.3, ease: easeOut },
  },
};

function optionClass(active: boolean) {
  return cn(
    "font-heading w-full cursor-pointer py-1 text-left text-[26px] leading-none font-bold tracking-[-0.02em] text-white uppercase transition-opacity duration-200",
    "active:scale-[0.99]",
    active ? "opacity-100" : "opacity-[0.32] hover:opacity-100",
  );
}

const sectionMetaClass =
  "text-[length:var(--meta-size)] font-normal tracking-[var(--meta-tracking)] text-white uppercase opacity-[0.35]";

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className={sectionMetaClass}>{children}</p>;
}

function CategoriesFilters({
  items,
  param = "c",
  onSelect,
}: {
  items: FilterItem[];
  param?: string;
  onSelect?: () => void;
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startRosterTransition } = useHeaderOverride();
  const reduce = useReducedMotion();
  const selectedCategory = searchParams.get(param);
  const selectedKind = searchParams.get("kind");
  const filterActive =
    Boolean(selectedCategory) || selectedKind === COACHES_FILTER_ID;

  const applyParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams);
    mutate(params);
    startRosterTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
    onSelect?.();
  };

  const clearFilters = () => {
    applyParams((params) => {
      params.delete(param);
      params.delete("kind");
    });
  };

  const setFilter = (id: string) => {
    applyParams((params) => {
      if (id === COACHES_FILTER_ID) {
        params.delete(param);
        params.set("kind", COACHES_FILTER_ID);
      } else {
        params.delete("kind");
        params.set(param, id);
      }
    });
  };

  return (
    <motion.div
      role="radiogroup"
      aria-label="Roster filters"
      variants={reduce ? undefined : listVariants}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <SectionLabel>Filters</SectionLabel>
        {filterActive ? (
          <button
            type="button"
            aria-label="Clear filters"
            className={cn(
              sectionMetaClass,
              "cursor-pointer transition-opacity duration-200 hover:opacity-100",
            )}
            onClick={clearFilters}
          >
            Clear
          </button>
        ) : null}
      </div>
      <div className="mb-3.5 border-b border-white/[0.08]" aria-hidden />
      <div className="flex flex-col">
        {items.map((item) => {
          const active =
            item.id === COACHES_FILTER_ID
              ? selectedKind === COACHES_FILTER_ID
              : selectedKind !== COACHES_FILTER_ID &&
                selectedCategory === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={optionClass(active)}
              onClick={() => setFilter(item.id)}
              variants={reduce ? undefined : itemVariants}
            >
              {item.name}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function chipClass(active: boolean) {
  return cn(
    "shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-[15px] font-medium whitespace-nowrap transition-colors duration-200",
    "active:scale-[0.98]",
    active
      ? "bg-white text-black"
      : "text-neutral-400 hover:text-white",
  );
}

function SectionsFilters({
  items,
  value,
  onChange,
}: {
  items: FilterItem[];
  value: string;
  onChange: (id: string) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="flex gap-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="radiogroup"
      aria-label="Sections"
      variants={reduce ? undefined : listVariants}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      {items.map((item) => {
        const active = value === item.id;
        return (
          <motion.button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={chipClass(active)}
            onClick={() => onChange(item.id)}
            variants={reduce ? undefined : itemVariants}
          >
            {item.name}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export default function Filters(
  props:
    | {
        items: FilterItem[];
        variant?: "categories";
        param?: string;
        label?: string;
        name?: string;
        onSelect?: () => void;
      }
    | {
        items: FilterItem[];
        variant: "sections";
        name?: string;
        value: string;
        onChange: (id: string) => void;
      },
) {
  if (props.variant === "sections") {
    return (
      <SectionsFilters
        items={props.items}
        value={props.value}
        onChange={props.onChange}
      />
    );
  }

  return (
    <CategoriesFilters
      items={props.items}
      param={props.param}
      onSelect={props.onSelect}
    />
  );
}

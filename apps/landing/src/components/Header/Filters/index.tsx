"use client";

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

const rowVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04, delayChildren: 0 },
  },
};

const chipVariants: Variants = {
  hidden: { opacity: 1, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};

const ALL_ID = "all";

function chipClass(active: boolean) {
  return cn(
    "shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-[15px] font-medium whitespace-nowrap transition-colors duration-200",
    "active:scale-[0.98]",
    active
      ? "bg-white text-black"
      : "text-neutral-400 hover:text-white",
  );
}

function CategoriesFilters({
  items,
  param = "c",
  layout = "scroll",
  onSelect,
}: {
  items: FilterItem[];
  param?: string;
  layout?: "scroll" | "wrap";
  onSelect?: () => void;
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startRosterTransition } = useHeaderOverride();
  const reduce = useReducedMotion();
  const selectedCategory = searchParams.get(param);
  const selectedKind = searchParams.get("kind");
  const allActive = !selectedCategory && selectedKind !== COACHES_FILTER_ID;

  const setFilter = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id === ALL_ID) {
      params.delete(param);
      params.delete("kind");
    } else if (id === COACHES_FILTER_ID) {
      params.delete(param);
      params.set("kind", COACHES_FILTER_ID);
    } else {
      params.delete("kind");
      params.set(param, id);
    }
    startRosterTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
    onSelect?.();
  };

  return (
    <motion.div
      className={
        layout === "wrap"
          ? "flex flex-wrap gap-1"
          : "flex gap-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      }
      role="radiogroup"
      aria-label="Roster filters"
      variants={reduce ? undefined : rowVariants}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      <motion.button
        type="button"
        role="radio"
        aria-checked={allActive}
        className={chipClass(allActive)}
        onClick={() => setFilter(ALL_ID)}
        variants={reduce ? undefined : chipVariants}
      >
        All
      </motion.button>
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
            className={chipClass(active)}
            onClick={() => setFilter(item.id)}
            variants={reduce ? undefined : chipVariants}
          >
            {item.name}
          </motion.button>
        );
      })}
    </motion.div>
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
      variants={reduce ? undefined : rowVariants}
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
            variants={reduce ? undefined : chipVariants}
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
        layout?: "scroll" | "wrap";
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
      layout={props.layout}
      onSelect={props.onSelect}
    />
  );
}

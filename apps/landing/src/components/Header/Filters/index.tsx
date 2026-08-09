"use client";

// Next
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Motion
import { motion, useReducedMotion, type Variants } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Components
import { useHeaderOverride } from "@/components/Header/HeaderProvider";

export type FilterItem = {
  id: string;
  name: string;
};

const easeOut = [0.16, 1, 0.3, 1] as const;

const rowVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.08 },
  },
};

const chipVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

function CategoriesFilters({
  items,
  param = "c",
  label = "Categories",
  name = "filter",
}: {
  items: FilterItem[];
  param?: string;
  label?: string;
  name?: string;
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startRosterTransition } = useHeaderOverride();
  const reduce = useReducedMotion();
  const selected = searchParams.get(param);

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (selected === id) {
      params.delete(param);
    } else {
      params.set(param, id);
    }
    const next = `${pathname}?${params.toString()}`;
    startRosterTransition(() => {
      replace(next);
    });
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(param);
    const next = `${pathname}?${params.toString()}`;
    startRosterTransition(() => {
      replace(next);
    });
  };

  return (
    <motion.div
      className={styles.container}
      variants={reduce ? undefined : rowVariants}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      <motion.p className={styles.meta} variants={reduce ? undefined : chipVariants}>
        <span>{label}</span>
      </motion.p>

      <motion.div
        className={styles.categories}
        variants={reduce ? undefined : rowVariants}
      >
        {items.map((item) => (
          <motion.label
            key={item.id}
            htmlFor={`${name}-${item.id}`}
            variants={reduce ? undefined : chipVariants}
          >
            <input
              type="radio"
              id={`${name}-${item.id}`}
              name={name}
              checked={selected === item.id}
              onChange={() => handleSelect(item.id)}
            />
            <span>{item.name}</span>
          </motion.label>
        ))}
      </motion.div>

      <motion.p
        className={`${styles.meta} ${styles.clear}`}
        onClick={handleClear}
        variants={reduce ? undefined : chipVariants}
      >
        <span>Clear</span>
      </motion.p>
    </motion.div>
  );
}

function SectionsFilters({
  items,
  name = "section",
  value,
  onChange,
}: {
  items: FilterItem[];
  name?: string;
  value: string;
  onChange: (id: string) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={styles.sections}
      variants={reduce ? undefined : rowVariants}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      <motion.div
        className={styles.categories}
        variants={reduce ? undefined : rowVariants}
      >
        {items.map((item) => (
          <motion.label
            key={item.id}
            htmlFor={`${name}-${item.id}`}
            variants={reduce ? undefined : chipVariants}
          >
            <input
              type="radio"
              id={`${name}-${item.id}`}
              name={name}
              checked={value === item.id}
              onChange={() => onChange(item.id)}
            />
            <span>{item.name}</span>
          </motion.label>
        ))}
      </motion.div>
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
        name={props.name}
        value={props.value}
        onChange={props.onChange}
      />
    );
  }

  return (
    <CategoriesFilters
      items={props.items}
      param={props.param}
      label={props.label}
      name={props.name}
    />
  );
}

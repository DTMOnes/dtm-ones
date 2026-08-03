"use client";

// Next
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// React
import { useMemo } from "react";

// Motion
import { motion } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Types
import { Category } from "@/types/category";

const labelVariants = {
  initial: {
    opacity: 0,
    rotateX: 90,
    translateY: 80,
    translateX: -20,
  },
  enter: (index: number) => ({
    opacity: 1,
    rotateX: 0,
    translateY: 0,
    translateX: 0,
    transition: {
      duration: 0.65,
      delay: 0.5 + index * 0.1,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  }),
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: [0.76, 0, 0.24, 1],
    },
  },
} as const;

export default function FiltersPannel({
  categories,
}: {
  categories: Category[];
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = useMemo(
    () => new Set(searchParams.getAll("c")),
    [searchParams],
  );

  const handleToggle = (id: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams);

    if (checked) {
      params.append("c", id);
    } else {
      params.delete("c", id);
    }

    replace(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);

    params.delete("c");

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ height: "0px", opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: "0px", opacity: 0 }}
      transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className={styles.header}>
        <p>Categories</p>
        <motion.div
          initial={{ opacity: 0.5 }}
          whileHover={{ opacity: 1 }}
          whileTap={{ opacity: 1, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          onClick={handleClear}
        >
          <Image
            src="/assets/icons/broom-bold.svg"
            alt="Clear"
            width={20}
            height={20}
          />
        </motion.div>
      </div>

      <div className={styles.content}>
        {categories.map((category, index) => (
          <motion.label
            key={category.id}
            htmlFor={category.id}
            className={styles.label}
            custom={index}
            variants={labelVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <input
              className={styles.input}
              id={category.id}
              type="checkbox"
              checked={selected.has(category.id)}
              onChange={(e) => handleToggle(category.id, e.target.checked)}
            />
            <span className={styles.name}>{category.name}</span>
          </motion.label>
        ))}
      </div>
    </motion.div>
  );
}

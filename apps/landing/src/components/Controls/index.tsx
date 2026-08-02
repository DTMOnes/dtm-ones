"use client";

// Next
import Image from "next/image";

// React
import { useState } from "react";

// Motion
import { motion, AnimatePresence } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Components
import Search from "./Search";
import FiltersToggle from "./Filters/Toggle";
import FiltersPannel from "./Filters/Pannel";
import Mode from "./Mode";

// Types
import { Category } from "@/types/category";

const controlsVariants = {
  open: {
    height: "auto",
    transition: {
      duration: 0.75,
      ease: [0.76, 0, 0.24, 1],
    },
  },
  closed: {
    height: "70px",
    transition: {
      duration: 0.75,
      ease: [0.76, 0, 0.24, 1],
      delay: 0.35,
    },
  },
} as const;

export default function Controls({ categories }: { categories: Category[] }) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <motion.div
      className={styles.controls}
      variants={controlsVariants}
      initial="closed"
      animate="open"
      exit="closed"
    >
      <Search />
      <FiltersToggle
        isOpen={isFiltersOpen}
        setIsOpen={() => setIsFiltersOpen(!isFiltersOpen)}
      />
      <Mode />
      <AnimatePresence>
        {isFiltersOpen && <FiltersPannel categories={categories} />}
      </AnimatePresence>
    </motion.div>
  );
}

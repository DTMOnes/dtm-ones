"use client";

// Next
import Image from "next/image";

// Motion
import { motion } from "motion/react";

// Styles
import styles from "./styles.module.scss";

const variants = {
  inactive: { opacity: 0.5 },
  active: { opacity: 1 },
  hover: { opacity: 1 },
  tap: { opacity: 1, scale: 0.8 },
} as const;

export default function FiltersToggle({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: () => void;
}) {
  return (
    <div className={styles.container} onClick={setIsOpen}>
      <motion.div
        className={styles.icon}
        variants={variants}
        initial="inactive"
        animate={isOpen ? "active" : "inactive"}
        whileHover="hover"
        whileTap="tap"
        transition={{ duration: 0.3 }}
      >
        <Image
          src="/assets/icons/faders-bold.svg"
          alt="images"
          width={24}
          height={24}
        />
      </motion.div>
    </div>
  );
}

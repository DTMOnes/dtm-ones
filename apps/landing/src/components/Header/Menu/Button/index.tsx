"use client";

// Next
import Image from "next/image";

// React
import { useState } from "react";

// Motion
import { motion, AnimatePresence } from "motion/react";

// Styles
import styles from "./styles.module.scss";

const buttonVariants = {
  initial: {
    opacity: 0.5,
  },
  hover: {
    opacity: 1,
  },
  tap: {
    opacity: 1,
    scale: 0.8,
  },
} as const;

export default function Button({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div className={styles.button} onClick={onClick}>
      <motion.div
        className={styles.slider}
        animate={{ top: isActive ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className={styles.element}>
          <Perspective>
            <Image
              className={styles.icon}
              src="/assets/icons/list-bold.svg"
              alt="Menu"
              width={24}
              height={24}
            />
          </Perspective>
        </div>

        <div className={styles.element}>
          <Perspective>
            <Image
              className={styles.icon}
              src="/assets/icons/x-bold-light.svg"
              alt="Menu"
              width={24}
              height={24}
            />
          </Perspective>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Perspective({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.perspective}>
      <div className={styles.item}>{children}</div>
      <div className={styles.item}>{children}</div>
    </div>
  );
}

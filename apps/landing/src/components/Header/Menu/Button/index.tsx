"use client";

import type { Ref } from "react";
import Image from "next/image";
import { motion } from "motion/react";

import styles from "./styles.module.scss";

export default function Button({
  isActive,
  onClick,
  buttonRef,
}: {
  isActive: boolean;
  onClick: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <motion.button
      ref={buttonRef}
      type="button"
      className={styles.button}
      onClick={onClick}
      aria-label={isActive ? "Close menu" : "Open menu"}
      aria-expanded={isActive}
      aria-controls="site-menu"
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className={styles.slider}
        animate={{ top: isActive ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
      >
        <span className={styles.element}>
          <Image
            className={styles.icon}
            src="/assets/icons/list-bold.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden
          />
        </span>
        <span className={`${styles.element} ${styles.close}`}>
          <Image
            className={styles.icon}
            src="/assets/icons/x-bold.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden
          />
        </span>
      </motion.div>
    </motion.button>
  );
}

"use client";

// Motion
import { motion } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Components
import Perspective from "./Perspective";

export default function Button({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className={styles.button}>
      <motion.div
        className={styles.slider}
        onClick={onClick}
        animate={{ top: isActive ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className={styles.el}>
          <Perspective icon="/assets/icons/list-bold.svg" />
        </div>
        <div className={styles.el}>
          <Perspective icon="assets/icons/x-bold.svg" />
        </div>
      </motion.div>
    </div>
  );
}

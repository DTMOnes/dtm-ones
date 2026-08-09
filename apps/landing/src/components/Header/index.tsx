"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Components
import Logo from "./Logo";
import Menu from "./Menu";

const easeOut = [0.16, 1, 0.3, 1] as const;

const chromeVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

export default function Header({
  brand,
  search,
  filters,
  stackCenterOnMobile = false,
}: {
  brand?: ReactNode;
  search?: ReactNode;
  filters?: ReactNode;
  /** Move the center slot under the top row on small screens (player sections). */
  stackCenterOnMobile?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.header
      className={`${styles.header}${stackCenterOnMobile ? ` ${styles.stack_center}` : ""}`}
      variants={reduce ? undefined : chromeVariants}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      <div className={styles.top_container}>
        <motion.div
          className={styles.start}
          variants={reduce ? undefined : itemVariants}
        >
          {brand ?? <Logo />}
        </motion.div>
        <motion.div
          className={styles.center}
          variants={reduce ? undefined : itemVariants}
        >
          {search}
        </motion.div>
        <motion.div
          className={styles.end}
          variants={reduce ? undefined : itemVariants}
        >
          <Menu />
        </motion.div>
      </div>
      {filters ? (
        <motion.div variants={reduce ? undefined : itemVariants}>
          {filters}
        </motion.div>
      ) : null}
    </motion.header>
  );
}

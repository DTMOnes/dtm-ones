"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import styles from "./styles.module.scss";

const easeOut = [0.16, 1, 0.3, 1] as const;

const stageVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 36,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: easeOut,
    },
  },
};

const metaVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

const metaItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: easeOut,
    },
  },
};

const metaLines = [
  "Founded in June 2000 by Gustavo Gorini, FIBA & JBA Agent",
  "FIBA license 2008019911",
  "FIBA Arbitration & Players' Rights",
];

export default function AboutView() {
  const reduce = useReducedMotion() ?? false;

  return (
    <main className={styles.container}>
      <div className={styles.media} aria-hidden />

      <motion.div
        className={styles.content}
        variants={reduce ? undefined : stageVariants}
        initial={reduce ? false : "hidden"}
        animate="show"
      >
        <motion.h1 variants={reduce ? undefined : itemVariants}>
          DTM ONES
        </motion.h1>

        <motion.p
          className={styles.paragraph}
          variants={reduce ? undefined : itemVariants}
        >
          Since 2000, DTM Ones has worked without interruption to build
          something rare in this industry — an agency where loyalty and hard
          work aren&apos;t talking points, but the way we operate every single
          day.{" "}
          <span className={styles.highlight}>
            Twenty-five years later, that&apos;s still the reputation we
            protect.
          </span>
        </motion.p>

        <motion.div
          className={styles.meta}
          variants={reduce ? undefined : metaVariants}
        >
          {metaLines.map((line) => (
            <motion.p
              key={line}
              variants={reduce ? undefined : metaItemVariants}
            >
              {line}
            </motion.p>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}

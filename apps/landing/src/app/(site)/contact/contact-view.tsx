"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import ContactForm from "./contact-form";
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

export default function ContactView() {
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
        <motion.h1
          className={styles.title}
          variants={reduce ? undefined : itemVariants}
        >
          Contact us
        </motion.h1>

        <motion.div variants={reduce ? undefined : itemVariants}>
          <ContactForm />
        </motion.div>
      </motion.div>
    </main>
  );
}

"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import styles from "./styles.module.scss";

const easeOut = [0.16, 1, 0.3, 1] as const;

const stageVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 1,
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

const metaVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

const metaItemVariants: Variants = {
  hidden: {
    opacity: 1,
    y: 12,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
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
        <motion.p className="kicker" variants={reduce ? undefined : itemVariants}>
          About
        </motion.p>
        <motion.h1
          className={styles.title}
          variants={reduce ? undefined : itemVariants}
        >
          DTMones
        </motion.h1>

        <motion.div
          className={styles.copy}
          variants={reduce ? undefined : itemVariants}
        >
          <p className={styles.paragraph}>
            We are a worldwide basketball agency, focused on player development
            and growth. Over 26 years of experience speak for themselves,
            supporting and guiding players throughout their careers and driving
            ourselves with values of hard work, commitment and loyalty.
          </p>
          <p>
            Working closely with basketball players to manage professional
            opportunities across multiple countries around the world, providing
            strategic guidance and ongoing support across each stage of their
            journey as basketball professionals.
          </p>
          <p>
            DTMones takes pride with the treatment provided to their clients,
            always aiming towards building strong and confident relationships
            based on trust, discipline and professionalism.
          </p>
          <p className={styles.highlight}>Let&apos;s draw the line of your dreams!</p>
        </motion.div>

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

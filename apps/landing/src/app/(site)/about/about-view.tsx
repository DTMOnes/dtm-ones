"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";

import styles from "./styles.module.scss";

const WORDMARK_SRC = "/assets/images/logo-dtm-ones.png";

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

  useEffect(() => {
    const root = document.documentElement;
    const footer = document.querySelector("footer");

    const syncStage = () => {
      const footerHeight = footer?.getBoundingClientRect().height ?? 65;
      root.style.setProperty("--landing-footer-height", `${footerHeight}px`);
    };

    syncStage();
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100dvh";
    document.body.style.maxHeight = "100dvh";

    const observer = footer ? new ResizeObserver(syncStage) : null;
    observer?.observe(footer!);
    window.addEventListener("resize", syncStage);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncStage);
      root.style.removeProperty("--landing-footer-height");
      root.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.maxHeight = "";
    };
  }, []);

  return (
    <main className={styles.container} data-about-stage>
      <div className={styles.mediaRail} aria-hidden>
        <div className={styles.media} />
      </div>

      <div className={styles.content}>
        <motion.div
          className={styles.contentInner}
          variants={reduce ? undefined : stageVariants}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
        <motion.div
          className={styles.brand}
          variants={reduce ? undefined : itemVariants}
        >
          <Image
            className="object-contain"
            src={WORDMARK_SRC}
            alt="DTM Ones"
            fill
            sizes="200px"
            priority
          />
        </motion.div>

        <motion.p
          className={styles.paragraph}
          variants={reduce ? undefined : itemVariants}
        >
          We are a worldwide basketball agency, focused on player development
          and growth. Over 26 years of experience speak for themselves,
          supporting and guiding players throughout their careers and driving
          ourselves with values of hard work, commitment and loyalty.
          <br />
          <br />
          Working closely with basketball players to manage professional
          opportunities across multiple countries around the world, providing
          strategic guidance and ongoing support across each stage of their
          journey as basketball professionals.
          <br />
          <br />
          DTM Ones takes pride with the treatment provided to their clients,
          always aiming towards building strong and confident relationships
          based on trust, discipline and professionalism.
          <br />
          <br />
          <span className={styles.highlight}>
            Let&apos;s draw the line of your dreams!
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
      </div>
    </main>
  );
}

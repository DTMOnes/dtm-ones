"use client";

// Next
import Link from "next/link";
import Image from "next/image";

// Motion
import { motion, AnimatePresence } from "motion/react";

// Components
import {
  DEFAULT_BRAND_TITLE,
  useHeaderOverride,
} from "@/components/Header/HeaderProvider";

// Styles
import styles from "./styles.module.scss";

const titleTransition = {
  duration: 0.3,
  ease: [0.19, 1, 0.22, 1] as const,
};

export default function Logo({
  title = DEFAULT_BRAND_TITLE,
}: {
  title?: string;
}) {
  const { setPendingTitle } = useHeaderOverride();
  const isBrandTitle = title === DEFAULT_BRAND_TITLE;

  return (
    <Link
      href="/"
      className={`${styles.container}${isBrandTitle ? ` ${styles.brand}` : ""}`}
      onClick={() => setPendingTitle(DEFAULT_BRAND_TITLE)}
    >
      <Image
        className={styles.image}
        src="/assets/dtm-ones-logo.svg"
        alt="Logo"
        width={30}
        height={25}
      />
      <span className={styles.text}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={title}
            className={styles.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={titleTransition}
          >
            {title}
          </motion.span>
        </AnimatePresence>
      </span>
    </Link>
  );
}

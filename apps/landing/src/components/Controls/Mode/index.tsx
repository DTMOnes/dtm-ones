"use client";

// Next
import Image from "next/image";

// React
import { useState } from "react";

// Motion
import { motion } from "motion/react";

// Styles
import styles from "./styles.module.scss";

const variants = {
  inactive: { opacity: 0.5 },
  active: { opacity: 1 },
  hover: { opacity: 1 },
  tap: { opacity: 1, scale: 0.9 },
} as const;

export default function Mode() {
  const [mode, setMode] = useState<"images" | "rows">("images");

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.box}
        initial={false}
        animate={{
          x: mode === "images" ? "-106%" : "5%",
          y: "-55%",
        }}
      />

      <motion.div
        className={styles.icon}
        variants={variants}
        animate={mode === "images" ? "active" : "inactive"}
        whileHover="hover"
        whileTap="tap"
        transition={{ duration: 0.3 }}
        onClick={() => setMode("images")}
      >
        <Image
          src="/assets/icons/image-bold.svg"
          alt="images"
          width={24}
          height={24}
        />
      </motion.div>
      <motion.div
        className={styles.icon}
        variants={variants}
        animate={mode === "rows" ? "active" : "inactive"}
        whileHover="hover"
        whileTap="tap"
        transition={{ duration: 0.3 }}
        onClick={() => setMode("rows")}
      >
        <Image
          src="/assets/icons/rows-bold.svg"
          alt="rows"
          width={24}
          height={24}
        />
      </motion.div>
    </div>
  );
}

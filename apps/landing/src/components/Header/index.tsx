"use client";

// Next
import Image from "next/image";

// React
import { useState } from "react";

// Motion
import { motion, AnimatePresence } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Components
import Nav from "./Nav";

const headerVariants = {
  open: {
    height: "auto",
    transition: {
      duration: 0.75,
      ease: [0.76, 0, 0.24, 1],
    },
  },
  closed: {
    height: "70px",
    transition: {
      duration: 0.75,
      ease: [0.76, 0, 0.24, 1],
      delay: 0.35,
    },
  },
} as const;

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

export default function Header() {
  const [isActive, setIsActive] = useState(false);

  return (
    <motion.header
      className={styles.header}
      variants={headerVariants}
      initial="closed"
      animate={isActive ? "open" : "closed"}
    >
      <div className={styles.main_container}>
        <Image
          className={styles.logo}
          src="/assets/dtm-ones-logo.svg"
          alt="Logo"
          width={30}
          height={25}
        />

        <motion.div
          className={isActive ? styles.menu_button_active : styles.menu_button}
          onClick={() => setIsActive(!isActive)}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          transition={{ duration: 0.3 }}
        >
          <Image
            src="/assets/icons/list-bold.svg"
            alt="Menu"
            width={24}
            height={24}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {isActive && <Nav onNavigate={() => setIsActive(false)} />}
      </AnimatePresence>
    </motion.header>
  );
}

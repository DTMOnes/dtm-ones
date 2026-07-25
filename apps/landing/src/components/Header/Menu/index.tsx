"use client";

// React
import { useState } from "react";

// Motion
import { motion, AnimatePresence } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Components
import Button from "./Button";
import Nav from "./Nav";

const variants = {
  open: {
    width: 480,
    height: 600,
    top: "-25px",
    right: "-25px",
    transition: {
      duration: 0.75,
      ease: [0.76, 0, 0.24, 1],
    },
  },
  closed: {
    width: 60,
    height: 60,
    top: "0px",
    right: "0px",
    transition: {
      duration: 0.75,
      ease: [0.76, 0, 0.24, 1],
      delay: 0.35,
    },
  },
} as const;

export default function Menu() {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  return (
    <div className={styles.menu}>
      <motion.div
        className={styles.collapsible}
        variants={variants}
        animate={isActive ? "open" : "closed"}
        initial="closed"
      >
        <AnimatePresence>{isActive && <Nav />}</AnimatePresence>
      </motion.div>
      <Button isActive={isActive} onClick={handleClick} />
    </div>
  );
}

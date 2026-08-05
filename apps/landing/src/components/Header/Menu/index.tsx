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
import Button from "./Button";
import Nav from "../Nav";

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

export default function Menu() {
  const [isActive, setIsActive] = useState(false);

  return (
    <motion.div className={styles.container}>
      <Button isActive={isActive} onClick={() => setIsActive(!isActive)} />

      <AnimatePresence>
        {/*isActive && <Nav onNavigate={() => setIsActive(false)} />*/}
      </AnimatePresence>
    </motion.div>
  );
}

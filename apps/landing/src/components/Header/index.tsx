"use client";

// React
import { useEffect, useState } from "react";

// Next
import { usePathname } from "next/navigation";

// Motion
import { motion, AnimatePresence } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Components
import Button from "./Button";
import Nav from "./Nav";

const variants = {
  open: {
    width: "var(--menu-w)",
    height: "var(--menu-h)",
    top: "-25px",
    right: "-25px",
    transition: {
      duration: 0.75,
      ease: [0.76, 0, 0.24, 1],
    },
  },
  closed: {
    width: "60px",
    height: "60px",
    top: "0px",
    right: "0px",
    transition: {
      duration: 0.75,
      ease: [0.76, 0, 0.24, 1],
      delay: 0.35,
    },
  },
} as const;

export default function Header() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(false);
  }, [pathname]);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  return (
    <header className={styles.header}>
      <motion.div
        className={styles.collapsible}
        variants={variants}
        animate={isActive ? "open" : "closed"}
        initial="closed"
      >
        <AnimatePresence>
          {isActive && <Nav onNavigate={() => setIsActive(false)} />}
        </AnimatePresence>
      </motion.div>
      <Button isActive={isActive} onClick={handleClick} />
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

import styles from "./styles.module.scss";
import { panelVariants } from "../Menu/variants";
import { isNavCurrent, overlayPages } from "../nav-data";
import Backdrop from "./Backdrop";

export default function Nav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key="site-menu"
      id="site-menu"
      className={styles.nav}
      variants={panelVariants}
      initial={shouldReduceMotion ? false : "initial"}
      animate="enter"
      exit={shouldReduceMotion ? undefined : "exit"}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <Backdrop />
      <div className={styles.stage}>
        <nav className={styles.pages} aria-label="Primary">
          {overlayPages.map((page) => {
            const isCurrent = isNavCurrent(pathname, page.href);

            return (
              <div
                key={page.label}
                className={`${styles.page} ${isCurrent ? styles.page_current : ""}`}
              >
                <Link
                  href={page.href}
                  className={styles.page_link}
                  onClick={onNavigate}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {page.label}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
}

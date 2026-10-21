"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

import { InstagramIcon, YoutubeIcon } from "@/components/icons";
import { pages, socials } from "@/config/site";

import Wordmark from "../Wordmark";
import menuStyles from "../Menu/styles.module.scss";
import { panelVariants } from "../Menu/variants";
import SplitLink from "./SplitLink";
import styles from "./styles.module.scss";

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
      <div className={styles.bar}>
        <Link href="/" aria-label="DTMones home" onClick={onNavigate}>
          <Wordmark />
        </Link>
        <button
          type="button"
          className={menuStyles.menuButton}
          onClick={onNavigate}
          aria-label="Close menu"
        >
          <span className={menuStyles.menuLabel}>Close</span>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M5 5l14 14M19 5L5 19"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>

      <nav className={styles.pages} aria-label="Primary">
        {pages.map((page, index) => {
          const isCurrent =
            page.href === "/" ? pathname === "/" : pathname.startsWith(page.href);

          return (
            <Link
              key={page.href}
              href={page.href}
              className={styles.link}
              onClick={onNavigate}
              aria-current={isCurrent ? "page" : undefined}
            >
              <SplitLink text={page.label} delay={0.12 + index * 0.08} />
            </Link>
          );
        })}
      </nav>

      <div className={styles.socials}>
        <a className="ico-box" href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
          <InstagramIcon />
        </a>
        <a className="ico-box" href={socials.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
          <YoutubeIcon />
        </a>
      </div>
    </motion.div>
  );
}

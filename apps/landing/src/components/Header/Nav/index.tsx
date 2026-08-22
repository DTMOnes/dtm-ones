"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

import styles from "./styles.module.scss";
import { fadeUpVariants, panelVariants } from "../Menu/variants";
import { overlayPages } from "../nav-data";
import Backdrop from "./Backdrop";
import SplitLink from "./SplitLink";

const pages = overlayPages;

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/dtm_ones/" },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UC_x5XG1OV2P6yVqAlKxpw6w",
  },
];

const legal = [
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

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
          {pages.map((page, index) => {
            const isCurrent =
              page.href === "/"
                ? pathname === "/"
                : pathname.startsWith(page.href);

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
                  <SplitLink text={page.label} delay={0.16 + index * 0.1} />
                </Link>
              </div>
            );
          })}
        </nav>

        <motion.footer
          className={styles.footer}
          custom={0.58}
          variants={fadeUpVariants}
        >
          <div className={styles.socials}>
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className={styles.social}
                target="_blank"
                rel="noreferrer"
              >
                {social.label}
              </a>
            ))}
          </div>
          <div className={styles.legal}>
            {legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={styles.legal_link}
                onClick={onNavigate}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./styles.module.scss";

const legalPages = [
  { label: "Terms and Conditions", href: "/terms-of-service" },
  { label: "Privacy Policy", href: "/privacy-policy" },
] as const;

export default function Footer() {
  const pathname = usePathname();

  // ponytail: player view is a locked 100dvh stage; hide until that layout is reworked.
  if (pathname.startsWith("/roster/")) return null;

  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>© {year} DTM Ones</p>

      <nav className={styles.legal} aria-label="Legal">
        {legalPages.map((item) => {
          const isCurrent = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={styles.legalLink}
              aria-current={isCurrent ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstagramLogo, YoutubeLogo } from "@phosphor-icons/react";

import styles from "./styles.module.scss";

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/dtm.ones/",
    Icon: InstagramLogo,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@dtmones6926",
    Icon: YoutubeLogo,
  },
] as const;

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

      <nav className={styles.socials} aria-label="Social">
        {socials.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            className={styles.social}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
          >
            <Icon size={20} weight="regular" aria-hidden />
          </a>
        ))}
      </nav>
    </footer>
  );
}

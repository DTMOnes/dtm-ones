"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Wordmark from "@/components/Header/Wordmark";
import { InstagramIcon, YoutubeIcon } from "@/components/icons";
import { legalPages, pages, socials } from "@/config/site";

import styles from "./styles.module.scss";

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div>
          <Wordmark height={28} />
          <p className={styles.tagline}>The line of your dreams</p>
        </div>

        <nav className={styles.nav} aria-label="Footer">
          {pages.map((page) => {
            const isCurrent =
              page.href === "/" ? pathname === "/" : pathname.startsWith(page.href);
            return (
              <Link
                key={page.href}
                href={page.href}
                className={styles.navLink}
                aria-current={isCurrent ? "page" : undefined}
              >
                {page.label}
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
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>© {year} DTMones</p>
        <nav className={styles.legal} aria-label="Legal">
          {legalPages.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.legalLink}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

"use client";

// Next
import Image from "next/image";
import Link from "next/link";

// Phosphor
import {
  InstagramLogoIcon,
  TiktokLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";

// Styles
import styles from "./styles.module.scss";

const SOCIALS = [
  { label: "Instagram", href: "#", Icon: InstagramLogoIcon },
  { label: "Tiktok", href: "#", Icon: TiktokLogoIcon },
  { label: "Youtube", href: "#", Icon: YoutubeLogoIcon },
] as const;

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Image
            src="/assets/dtm-ones-logo.svg"
            alt="DTM Ones"
            width={88}
            height={88}
            className={styles.logo}
          />
          <p className={styles.copyright}>
            Copyright &copy; {new Date().getFullYear()} DTM Ones.
            <br />
            All rights reserved.
          </p>
        </div>

        <nav className={styles.legal} aria-label="Legal">
          <Link href="#" className={styles.link}>
            Privacy Policy
          </Link>
          <Link href="#" className={styles.link}>
            Terms of Service
          </Link>
        </nav>

        <div className={styles.contact}>
          <a href="mailto:info@dtmones.com" className={styles.link}>
            info@dtmones.com
          </a>
          <a href="tel:+13058471928" className={styles.link}>
            +1 (305) 847-1928
          </a>
        </div>

        <ul className={styles.socials}>
          {SOCIALS.map(({ label, href, Icon }) => (
            <li key={label}>
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                {label}
                <Icon size={20} className={styles.socialIcon} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

"use client";

// React
import { useEffect, useState } from "react";

// Next
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Motion
import { AnimatePresence, motion } from "motion/react";

// Phosphor
import {
  InstagramLogoIcon,
  ListIcon,
  TiktokLogoIcon,
  XIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";

// Styles
import styles from "./styles.module.scss";

const SECTIONS = [
  { id: "hero", label: "Home", href: "/#hero" },
  { id: "values", label: "About", href: "/#values" },
  { id: "roster", label: "Roster", href: "/#roster" },
  { id: "contact", label: "Connect", href: "/#contact" },
] as const;

const LOGO_LIGHT = "/assets/dtm-ones-logo.svg";
const LOGO_DARK = "/assets/dtm-ones-logo-black.svg";

const SOCIALS = [
  { label: "Instagram", href: "#", Icon: InstagramLogoIcon },
  { label: "Tiktok", href: "#", Icon: TiktokLogoIcon },
  { label: "Youtube", href: "#", Icon: YoutubeLogoIcon },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", `/#${id}`);
  };

  const onSectionLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    setOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      scrollToSection(id);
    }
  };

  return (
    <>
      <header className={`${styles.bar} ${open ? styles.barOpen : ""}`}>
        <Link href="/" className={styles.logoWrap} aria-label="DTM Ones home">
          <Image
            src={open ? LOGO_DARK : LOGO_LIGHT}
            alt=""
            width={140}
            height={42}
            className={styles.logo}
            priority
          />
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          <ul className={styles.desktopList}>
            {SECTIONS.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={styles.desktopLink}
                  onClick={(e) => onSectionLinkClick(e, item.id)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={`${styles.menuTrigger} ${open ? styles.menuTriggerOpen : ""}`}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <XIcon weight="regular" className={styles.menuIcon} aria-hidden />
          ) : (
            <ListIcon weight="regular" className={styles.menuIcon} aria-hidden />
          )}
        </button>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className={styles.overlayInner}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <nav className={styles.nav} aria-label="Primary mobile">
                <ul className={styles.navList}>
                  {SECTIONS.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={styles.navLink}
                        onClick={(e) => onSectionLinkClick(e, item.id)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <ul className={styles.socials}>
                {SOCIALS.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialsLink}
                      onClick={() => setOpen(false)}
                    >
                      {label}
                      <Icon size={22} className={styles.socialsIcon} aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

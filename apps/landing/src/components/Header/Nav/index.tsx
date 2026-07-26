"use client";

// Next
import Link from "next/link";
import Image from "next/image";

// Motion
import { motion } from "motion/react";

// Styles
import styles from "./styles.module.scss";

const pages = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

const socials = [
  {
    label: "Instagram",
    icon: "/assets/icons/instagram-logo-bold.svg",
    href: "https://www.instagram.com/dtm_ones/",
  },
  {
    label: "Facebook",
    icon: "/assets/icons/facebook-logo-bold.svg",
    href: "https://www.facebook.com/dtm_ones/",
  },
  {
    label: "Youtube",
    icon: "/assets/icons/youtube-logo-bold.svg",
    href: "https://www.youtube.com/channel/UC_x5XG1OV2P6yVqAlKxpw6w",
  },
  {
    label: "Linkedin",
    icon: "/assets/icons/linkedin-logo-bold.svg",
    href: "https://www.linkedin.com/company/dtm-ones/",
  },
];

const footer = [
  {
    label: "Terms of Service",
    href: "/terms-of-service",
  },
  {
    label: "Privacy Policy",
    href: "/privacy-policy",
  },
];

const variants = {
  initial: {
    opacity: 0,
    rotateX: 90,
    translateY: 80,
    translateX: -20,
  },
  enter: (index: number) => ({
    opacity: 1,
    rotateX: 0,
    translateY: 0,
    translateX: 0,
    transition: {
      duration: 0.65,
      // opacity: { duration: 0.35 },
      delay: 0.5 + index * 0.1,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  }),
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: [0.76, 0, 0.24, 1],
    },
  },
} as const;

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.pages}>
        {pages.map((e, index) => (
          <div key={e.label} className={styles.page_link_container}>
            <motion.div
              key={e.label}
              custom={index}
              variants={variants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              <Link href={e.href} className={styles.page_link}>
                <span className={styles.number}>0{index + 1}</span>
                {e.label}
              </Link>
            </motion.div>
          </div>
        ))}
      </div>

      <motion.div
        className={styles.separator}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.2,
          transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.75 },
        }}
        exit={{
          opacity: 0,
          transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
        }}
      />

      <div className={styles.socials}>
        {socials.map((e, index) => (
          <motion.div
            key={e.label}
            custom={index}
            variants={variants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <Link href={e.href} className={styles.social_link}>
              <Image src={e.icon} alt={e.label} width={26} height={26} />
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        className={styles.separator}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.2,
          transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.85 },
        }}
        exit={{
          opacity: 0,
          transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
        }}
      />

      <footer className={styles.footer}>
        {footer.map((e, index) => (
          <motion.div
            key={e.label}
            custom={index}
            variants={variants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <Link href={e.href} className={styles.footer_link}>
              {e.label}
            </Link>
          </motion.div>
        ))}
      </footer>
    </nav>
  );
}

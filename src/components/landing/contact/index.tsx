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

export default function Contact() {
  return (
    <section className={styles.container}>
      <div className={styles.contact}>
        <div className={styles.contact_content}>
          <h2 className={styles.title}>Contact Us</h2>
          <p className={styles.subtitle}>
            We're always open to meaningful conversations about basketball,
            careers, and opportunities.
          </p>
        </div>

        <div className={styles.links}>
          <Link href="/contact" className={`${styles.button} ${styles.left}`}>
            Check Our Roster
          </Link>
          <Link href="/roster" className={`${styles.button} ${styles.right}`}>
            Reach Out
          </Link>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footer_content}>
          <div className={styles.copyright}>
            <p>Copyright &copy; 2026 DTM Ones.</p>
            <p>All rights reserved.</p>
          </div>

          <div className={styles.info}>
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
        </div>

        <div className={styles.socials}>
          <Link href="#" target="_blank" className={styles.socials_link}>
            Instagram
            <InstagramLogoIcon size={24} className={styles.socials_icon} />
          </Link>

          <Link href="#" target="_blank" className={styles.socials_link}>
            Tiktok
            <TiktokLogoIcon size={24} className={styles.socials_icon} />
          </Link>

          <Link href="#" target="_blank" className={styles.socials_link}>
            Youtube
            <YoutubeLogoIcon size={24} className={styles.socials_icon} />
          </Link>
        </div>
      </footer>

      <Image
        src="/assets/dtm-ones-logo.svg"
        alt="Logo"
        width={100}
        height={100}
        className={styles.logo}
      />
    </section>
  );
}

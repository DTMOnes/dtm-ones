"use client";

// Next
import Image from "next/image";

// Styles
import styles from "./styles.module.scss";

export default function Footer() {
  return (
    <footer className={styles.container}>
      <div className={styles.content}>
        <div className={styles.info}>
          <p>Privacy Policy</p>
          <p>Terms of Service</p>
        </div>
        <p>Copyright &copy; 2026 DTM Ones. All rights reserved.</p>
      </div>

      <Image
        src="/assets/dtm-ones-logo.svg"
        alt="Logo"
        width={100}
        height={100}
        className={styles.logo}
      />
    </footer>
  );
}

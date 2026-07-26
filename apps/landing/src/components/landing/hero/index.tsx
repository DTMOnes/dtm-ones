import Link from "next/link";

import styles from "./styles.module.scss";

export default function Hero() {
  return (
    <section id="hero" className={styles.container} aria-label="Introduction">
      <div className={styles.background} aria-hidden="true">
        <div className={styles.background_image} />
        <div className={styles.background_overlay} />
        <div className={styles.background_blob} />
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>
          THE NAME <br /> TALENT TRUSTS
        </h1>
        <p className={styles.subtitle}>
          We are a full-service talent agency that represents a wide range of
          talent, from actors to athletes.
        </p>
        <div className={styles.button_container}>
          <Link href="/roster" className={styles.button}>
            Check Our Roster
          </Link>
          <Link href="/contact" className={styles.button}>
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}

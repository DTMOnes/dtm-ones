// Styles
import styles from "./styles.module.scss";

export default function Footer() {
  return (
    <footer className={styles.container}>
      <div className={styles.background_blob} />

      <div className={styles.content}>
        <span>&copy; 2026 DTM ONES. All rights reserved.</span>

        <div className={styles.links}>
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
}

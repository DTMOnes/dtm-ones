import Link from "next/link";

import Menu from "./Menu";
import Wordmark from "./Wordmark";
import styles from "./styles.module.scss";

export default function Header({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={overlay ? `${styles.header} ${styles.overlay}` : styles.header}>
      <div className={styles.brand}>
        <Link href="/" aria-label="DTMones home" className={styles.logo}>
          <Wordmark />
        </Link>
        <span className={styles.divider} aria-hidden />
        <span className={styles.sub}>Basketball · Worldwide</span>
      </div>
      <Menu />
    </header>
  );
}

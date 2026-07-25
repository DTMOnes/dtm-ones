// Styles
import styles from "./styles.module.scss";

// Components
import Menu from "./Menu";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>DTM ONES</div>

      <Menu />
    </header>
  );
}

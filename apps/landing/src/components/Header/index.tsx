import type { ReactNode } from "react";

// Styles
import styles from "./styles.module.scss";

// Components
import Logo from "./Logo";
import Menu from "./Menu";

export default function Header({
  brand,
  search,
  filters,
  stackCenterOnMobile = false,
}: {
  brand?: ReactNode;
  search?: ReactNode;
  filters?: ReactNode;
  /** Move the center slot under the top row on small screens (player sections). */
  stackCenterOnMobile?: boolean;
}) {
  return (
    <header
      className={`${styles.header}${stackCenterOnMobile ? ` ${styles.stack_center}` : ""}`}
    >
      <div className={styles.top_container}>
        <div className={styles.start}>{brand ?? <Logo />}</div>
        <div className={styles.center}>{search}</div>
        <div className={styles.end}>
          <Menu />
        </div>
      </div>
      {filters}
    </header>
  );
}

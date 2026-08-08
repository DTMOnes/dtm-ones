// Styles
import styles from "./styles.module.scss";

export default function GridLoading() {
  return (
    <main className={styles.loading} aria-busy="true" aria-label="Loading players">
      <span className={styles.spinner} />
    </main>
  );
}

// Styles
import styles from "./styles.module.scss";

const SKELETON_COUNT = 6;

export default function GridLoading() {
  return (
    <div className={styles.loading} aria-busy="true" aria-label="Loading players">
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <div
          key={index}
          className={styles.skeleton}
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <span className={styles.shimmer} />
          <div className={styles.meta}>
            <span className={styles.lineName} />
            <span className={styles.lineRole} />
          </div>
        </div>
      ))}
    </div>
  );
}

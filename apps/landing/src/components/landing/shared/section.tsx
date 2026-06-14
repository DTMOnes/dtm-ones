import type { ReactNode } from "react";

// Styles
import styles from "./section.module.scss";

type SectionProps = {
  id: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export default function Section({
  id,
  children,
  className = "",
  ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${styles.section} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <div className={styles.inner}>{children}</div>
    </section>
  );
}

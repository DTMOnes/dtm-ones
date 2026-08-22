import type { ReactNode } from "react";

import styles from "./styles.module.scss";

export default function LegalDoc({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.main}>
      <article className={styles.article}>
        <h1>{title}</h1>
        {children}
      </article>
    </main>
  );
}

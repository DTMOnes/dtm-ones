import type { Metadata } from "next";

import styles from "./styles.module.scss";

export const metadata: Metadata = {
  title: "About | DTM Ones",
  description:
    "Learn how DTM Ones supports basketball players and coaches worldwide.",
};

export default function AboutPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1>DTM ONES</h1>
        <p className={styles.paragraph}>
          Since 2000, DTM Ones has worked without interruption to build
          something rare in this industry — an agency where loyalty and hard
          work aren&apos;t talking points, but the way we operate every single
          day.{" "}
          <span className={styles.highlight}>
            Twenty-five years later, that&apos;s still the reputation we
            protect.
          </span>
        </p>
        <p>Founded in June 2000 by Gustavo Gorini, FIBA & JBA Agent</p>
        <p>FIBA license 2008019911</p>
        <p>FIBA Arbitration & Players&apos; Rights</p>
      </div>
    </main>
  );
}

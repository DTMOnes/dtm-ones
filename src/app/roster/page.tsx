import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/landing/header";
import Roster from "@/components/landing/roster";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Roster — DTM Ones",
  description: "DTM Ones roster and gallery.",
};

export default function RosterPage() {
  return (
    <main className={styles.page}>
      <Header />
      <Link href="/" className={styles.back}>
        ← Back home
      </Link>
      <Roster />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/landing/header";
import RosterGallery from "@/components/landing/roster-gallery";
import Footer from "@/components/landing/footer";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Roster — DTM Ones",
  description: "DTM Ones roster and gallery.",
};

export default function RosterPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <Link href="/" className={styles.back}>
          Back home
        </Link>
        <RosterGallery />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import ContactForm from "@/components/contact/contact-form";
import Header from "@/components/landing/header";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Contact — DTM Ones",
  description:
    "Reach out about basketball, careers, and opportunities with DTM Ones.",
};

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <Header />
      <Link href="/" className={styles.back}>
        ← Back home
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Contact</h1>
        <p className={styles.subtitle}>
          We&apos;re always open to meaningful conversations about basketball,
          careers, and opportunities.
        </p>
      </div>

      <ContactForm />
    </main>
  );
}

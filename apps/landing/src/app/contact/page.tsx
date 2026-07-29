import type { Metadata } from "next";

import ContactForm from "./contact-form";
import styles from "./styles.module.scss";

export const metadata: Metadata = {
  title: "Contact | DTM Ones",
  description:
    "Reach out to DTM Ones about basketball careers and opportunities.",
};

export default function ContactPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Contact us</h1>
        <ContactForm />
      </div>
    </main>
  );
}

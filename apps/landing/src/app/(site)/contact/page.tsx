import type { Metadata } from "next";

import ContactView from "./contact-view";

export const metadata: Metadata = {
  title: "Contact | DTM Ones",
  description:
    "Reach out to DTM Ones about basketball careers and opportunities.",
};

export default function ContactPage() {
  return <ContactView />;
}

import type { Metadata } from "next";

import ContactView from "./contact-view";

export const metadata: Metadata = {
  title: "Contact | DTMones",
  description:
    "Reach out to DTMones about basketball careers and opportunities.",
};

export default function ContactPage() {
  return <ContactView />;
}

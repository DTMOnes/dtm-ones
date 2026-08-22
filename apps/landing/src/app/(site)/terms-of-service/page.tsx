import type { Metadata } from "next";
import Link from "next/link";

import LegalDoc from "@/components/Legal";

export const metadata: Metadata = {
  title: "Terms and Conditions | DTM Ones",
  description: "Terms for using the DTM Ones public website.",
};

export default function Page() {
  return (
    <LegalDoc title="Terms and Conditions">
      <p>
        These terms cover use of the DTM Ones public website, including the
        Roster, player pages, and the contact form.
      </p>

      <h2>The site</h2>
      <p>
        DTM Ones is a basketball agency. This site shows public Clients on the
        Roster and accepts inquiries. Information is provided so clubs, scouts,
        and people seeking representation can learn about the agency and get in
        touch. It is not a contract for representation or a hiring offer.
      </p>

      <h2>Using the Roster</h2>
      <p>
        You may browse public profiles for legitimate basketball inquiries. Do
        not scrape, copy, or republish Roster content, images, or videos in bulk
        or for a competing directory. Player highlight videos are hosted by
        YouTube and are subject to YouTube terms when you play them.
      </p>

      <h2>Contact form</h2>
      <p>
        Send a ContactRequest only for a genuine inquiry: seeking representation
        or looking for a player. Do not submit spam, automated messages, or
        false contact details. Submitting the form does not create an agency
        relationship.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms as the site changes. Continued use after an
        update means you accept the current version. How we handle information
        you send us is described in the{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
    </LegalDoc>
  );
}

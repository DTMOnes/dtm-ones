import type { Metadata } from "next";
import Link from "next/link";

import LegalDoc from "@/components/Legal";

export const metadata: Metadata = {
  title: "Privacy Policy | DTM Ones",
  description:
    "How DTM Ones handles information on the public website. This site does not use cookies.",
};

export default function Page() {
  return (
    <LegalDoc title="Privacy Policy">
      <p>
        This policy describes how the DTM Ones public website handles
        information. This site does not use cookies and does not show a cookie
        banner.
      </p>

      <h2>Cookies</h2>
      <p>
        We do not set cookies on this website. We do not use analytics cookies,
        advertising cookies, or a cookie consent tool.
      </p>
      <p>
        Player highlight videos are embedded with YouTube privacy-enhanced mode
        (youtube-nocookie.com). Playing a video may still let YouTube set
        cookies under YouTube policies. That happens only if you press play. We
        do not set those cookies ourselves.
      </p>

      <h2>ContactRequests</h2>
      <p>If you use the contact form, we collect:</p>
      <ul>
        <li>Inquiry reason (seeking representation or looking for a player)</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Message</li>
      </ul>
      <p>
        Staff use that information to respond to your inquiry. We do not sell it
        and we do not use it for advertising.
      </p>

      <h2>Browsing</h2>
      <p>
        You can browse the Roster and public pages without creating an account
        and without us identifying you through cookies.
      </p>

      <h2>Questions</h2>
      <p>
        For privacy questions, use the <Link href="/contact">contact form</Link>.
        Related terms for using the site are in the{" "}
        <Link href="/terms-of-service">Terms and Conditions</Link>.
      </p>
    </LegalDoc>
  );
}

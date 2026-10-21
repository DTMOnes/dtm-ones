import type { Metadata } from "next";

import AboutView from "./about-view";

export const metadata: Metadata = {
  title: "About | DTMones",
  description:
    "Learn how DTMones supports basketball players and coaches worldwide.",
};

export default function Page() {
  return <AboutView />;
}

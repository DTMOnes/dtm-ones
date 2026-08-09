import type { Metadata } from "next";

import AboutView from "./about-view";

export const metadata: Metadata = {
  title: "About | DTM Ones",
  description:
    "Learn how DTM Ones supports basketball players and coaches worldwide.",
};

export default function Page() {
  return <AboutView />;
}

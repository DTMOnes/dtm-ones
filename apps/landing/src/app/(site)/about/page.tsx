import type { Metadata } from "next";

import AboutView from "./about-view";

export const metadata: Metadata = {
  title: "About | DTM Ones",
  description:
    "Worldwide basketball agency focused on player development and growth, with over 26 years of experience guiding players through their professional careers.",
};

export default function Page() {
  return <AboutView />;
}

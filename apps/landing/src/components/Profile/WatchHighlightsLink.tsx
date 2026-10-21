"use client";

import { PlayIcon } from "@/components/icons";

/** Scrolls to the Highlights section and flashes it briefly so the eye lands there. */
export default function WatchHighlightsLink() {
  return (
    <a
      className="btn btn-red"
      href="#highlights"
      onClick={(event) => {
        const target = document.getElementById("highlights");
        if (!target) return;
        event.preventDefault();

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", "#highlights");
        target.animate(
          [
            { backgroundColor: "rgb(225 10 30 / 0.14)", boxShadow: "inset 0 0 0 2px var(--red-500)" },
            { backgroundColor: "rgb(225 10 30 / 0)", boxShadow: "inset 0 0 0 2px transparent" },
          ],
          { duration: 1600, delay: reduce ? 0 : 450, easing: "ease-out" },
        );
      }}
    >
      <PlayIcon />
      Watch highlights
    </a>
  );
}

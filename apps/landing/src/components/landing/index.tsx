"use client";

import { useEffect } from "react";

import { ReactLenis } from "lenis/react";

import Hero from "@/components/landing/hero";
import About from "@/components/landing/about";
import Roster from "@/components/landing/roster";
import Contact from "@/components/landing/contact";
import Footer from "@/components/landing/footer";
import type { PublicRosterPlayer } from "@/types/roster";

import styles from "./styles.module.scss";

type LandingProps = {
  players: PublicRosterPlayer[];
};

export default function Landing({ players }: LandingProps) {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);
    const run = () =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.05 }}>
      <main className={styles.main}>
        <Hero />
        <About />
        <Roster players={players} />
        <Contact />
        <Footer />
      </main>
    </ReactLenis>
  );
}

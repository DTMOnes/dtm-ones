"use client";

// React
import { useEffect } from "react";

// Lenis
import { ReactLenis } from "lenis/react";

// Components
import Hero from "@/components/landing/hero";
import About from "@/components/landing/about";

// Styles
import styles from "./styles.module.scss";

export default function Page() {
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
      </main>
    </ReactLenis>
  );
}

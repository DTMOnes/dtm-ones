"use client";

// React
import { useRef } from "react";

// Motion
import { AnimatePresence } from "motion/react";

// Lenis
import { ReactLenis } from "lenis/react";

// Styles
import styles from "./styles.module.scss";

// Components
import Cards from "../Cards";

// Types
import { PublicRosterPlayer } from "@/types/roster";

export default function Grid({ players }: { players: PublicRosterPlayer[] }) {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <main ref={constraintsRef} className={styles.container}>
      <ReactLenis root options={{ lerp: 0.05 }}>
        <AnimatePresence mode="wait">
          {players.map((player, index) => (
            <Cards key={player.id} player={player} index={index} />
          ))}
        </AnimatePresence>
      </ReactLenis>
    </main>
  );
}

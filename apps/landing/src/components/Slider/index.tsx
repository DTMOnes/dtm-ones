"use client";

// Lenis
import ReactLenis from "lenis/react";

// Styles
import styles from "./styles.module.scss";

// Components
import Cards from "../Cards";

// Types
import { PublicRosterPlayer } from "@/types/roster";

export default function Slider({ players }: { players: PublicRosterPlayer[] }) {
  return (
    <ReactLenis root options={{ lerp: 0.05 }}>
      <main className={styles.container}>
        {players.map((player) => (
          <Cards key={player.id} player={player} />
        ))}
      </main>
    </ReactLenis>
  );
}

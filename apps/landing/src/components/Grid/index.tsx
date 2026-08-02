"use client";

// React
import { useRef, useState } from "react";

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

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  return (
    <main ref={constraintsRef} className={styles.container}>
      <ReactLenis root options={{ lerp: 0.05 }}>
        {players.map((player) => (
          <Cards
            key={player.id}
            player={player}
            isSelected={selectedPlayerId === player.id}
            onSelect={() =>
              setSelectedPlayerId((current) =>
                current === player.id ? null : player.id,
              )
            }
          />
        ))}
      </ReactLenis>
    </main>
  );
}

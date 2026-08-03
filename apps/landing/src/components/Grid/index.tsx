"use client";

// React
import { useRef } from "react";

// Motion
import { AnimatePresence } from "motion/react";

// Lenis
import { ReactLenis } from "lenis/react";

// Hooks
import { useViewMode } from "@/components/ViewModeProvider";

// Styles
import styles from "./styles.module.scss";

// Components
import PictureCards from "../PictureCards";
import InfoCards from "../InfoCards";

// Types
import { PublicRosterPlayer } from "@/types/roster";

export default function Grid({ players }: { players: PublicRosterPlayer[] }) {
  const constraintsRef = useRef<HTMLDivElement>(null);

  const { mode } = useViewMode();

  return (
    <main ref={constraintsRef} className={styles.container}>
      <ReactLenis root options={{ lerp: 0.05 }}>
        <AnimatePresence mode="wait">
          {mode === "images" ? (
            players.map((player, index) => (
              <PictureCards key={player.id} player={player} index={index} />
            ))
          ) : (
            <div className={styles.list}>
              {players.map((player, index) => (
                <InfoCards key={player.id} player={player} index={index} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </ReactLenis>
    </main>
  );
}

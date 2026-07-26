"use client";

// React
import { useCallback, useEffect, useRef, useState, useLayoutEffect } from "react";

// Motion
import {
  motion,
  useMotionValue,
  AnimatePresence,
  useSpring,
} from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Components
import Cards from "../Cards";
import Gallery from "../Gallery";

// Utils
import { calculateRows } from "@/utils/calculate-rows";

// Types
import { PublicRosterPlayer } from "@/types/roster";

const SPRING = { stiffness: 120, damping: 32, mass: 1.1 };
const REVEAL_TIMEOUT_MS = 4000;

export default function Canvas({ players }: { players: PublicRosterPlayer[] }) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const readyIdsRef = useRef(new Set<string>());

  const [selectedPlayer, setSelectedPlayer] =
    useState<PublicRosterPlayer | null>(null);
  const [reveal, setReveal] = useState(players.length === 0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, SPRING);
  const smoothY = useSpring(y, SPRING);

  const rows = calculateRows(players.length);
  const offsets = rows.map((_, i) =>
    rows.slice(0, i).reduce((sum, n) => sum + n, 0),
  );

  const centerPlane = useCallback(() => {
    const viewport = constraintsRef.current;
    const plane = planeRef.current;
    if (!viewport || !plane) return;

    const nextX = (viewport.clientWidth - plane.offsetWidth) / 2;
    const nextY = (viewport.clientHeight - plane.offsetHeight) / 2;

    x.set(nextX);
    y.set(nextY);
    smoothX.jump(nextX);
    smoothY.jump(nextY);
  }, [x, y, smoothX, smoothY]);

  useLayoutEffect(() => {
    centerPlane();
  }, [centerPlane, rows.length, players.length]);

  useEffect(() => {
    if (reveal || players.length === 0) return;

    const timeoutId = window.setTimeout(() => {
      centerPlane();
      setReveal(true);
    }, REVEAL_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [reveal, players.length, centerPlane]);

  const handleCardReady = useCallback(
    (id: string) => {
      if (readyIdsRef.current.has(id)) return;
      readyIdsRef.current.add(id);

      if (readyIdsRef.current.size >= players.length) {
        centerPlane();
        setReveal(true);
      }
    },
    [centerPlane, players.length],
  );

  return (
    <div ref={constraintsRef} className={styles.viewport}>
      <motion.div
        ref={planeRef}
        className={styles.plane}
        style={{ x: smoothX, y: smoothY }}
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0.2}
        whileDrag={{ cursor: "grabbing" }}
        {...{ _dragX: x, _dragY: y }}
      >
        {rows.map((count, r) => {
          const cards = players.slice(offsets[r], offsets[r] + count);

          return (
            <motion.div
              key={r}
              className={styles.row}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.04,
                    delayChildren: 0.08 + offsets[r] * 0.04,
                  },
                },
              }}
              initial="hidden"
              animate={reveal ? "visible" : "hidden"}
            >
              {cards.map((player: PublicRosterPlayer) => (
                <Cards
                  key={player.id}
                  player={player}
                  reveal={reveal}
                  onReady={handleCardReady}
                  onSelect={() => setSelectedPlayer(player)}
                />
              ))}
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {selectedPlayer && (
          <Gallery
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

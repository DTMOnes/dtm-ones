"use client";

// React
import { useRef, useLayoutEffect } from "react";

// Motion
import { motion, useMotionValue } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Components
import Card from "@/components/Card";

// Utils
import { calculateRows } from "@/utils/calculate-rows";

const TOTAL_CARDS = Array.from({ length: 40 }, (_, i) => i);

export default function Canvas() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rows = calculateRows(TOTAL_CARDS.length);
  const offsets = rows.map((_, i) =>
    rows.slice(0, i).reduce((sum, n) => sum + n, 0),
  );

  useLayoutEffect(() => {
    const viewport = constraintsRef.current;
    const plane = planeRef.current;
    if (!viewport || !plane) return;

    x.set((viewport.clientWidth - plane.offsetWidth) / 2);
    y.set((viewport.clientHeight - plane.offsetHeight) / 2);
  }, [x, y, rows.length]);

  return (
    <div ref={constraintsRef} className={styles.viewport}>
      <motion.div
        ref={planeRef}
        className={styles.plane}
        style={{ x, y }}
        drag
        dragConstraints={constraintsRef}
        dragTransition={{ power: 0.05, timeConstant: 400 }}
        whileDrag={{ cursor: "grabbing" }}
      >
        {rows.map((count, r) => {
          const cards = TOTAL_CARDS.slice(offsets[r], offsets[r] + count);

          return (
            <div key={r} className={styles.row}>
              {cards.map((card) => (
                <Card key={card} />
              ))}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

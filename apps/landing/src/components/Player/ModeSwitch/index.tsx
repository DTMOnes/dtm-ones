"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { PlayerSectionId } from "@/components/Header/Filters/player-sections";

import styles from "./styles.module.scss";

type Item = { id: PlayerSectionId; name: string };

const ease = [0.16, 1, 0.3, 1] as const;

export default function PlayerModeSwitch({
  items,
  value,
  onChange,
}: {
  items: readonly Item[];
  value: PlayerSectionId;
  onChange: (id: PlayerSectionId) => void;
}) {
  const reduce = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [thumb, setThumb] = useState({ x: 0, width: 0 });

  useLayoutEffect(() => {
    const sync = () => {
      const index = items.findIndex((item) => item.id === value);
      const btn = btnRefs.current[index];
      if (!btn) return;
      setThumb({ x: btn.offsetLeft, width: btn.offsetWidth });
    };

    sync();
    const fonts = document.fonts?.ready.then(sync).catch(() => undefined);
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      void fonts;
    };
  }, [items, value]);

  return (
    <nav ref={navRef} className={styles.nav} aria-label="Player sections">
      <motion.span
        className={styles.indicator}
        aria-hidden
        initial={false}
        animate={{ x: thumb.x, width: thumb.width }}
        transition={
          reduce || thumb.width === 0
            ? { duration: 0 }
            : { type: "tween", duration: 0.28, ease }
        }
      />
      {items.map((item, index) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            ref={(el) => {
              btnRefs.current[index] = el;
            }}
            type="button"
            className={styles.seg}
            aria-current={active ? "true" : undefined}
            onClick={() => onChange(item.id)}
          >
            <span className={styles.label}>{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
}

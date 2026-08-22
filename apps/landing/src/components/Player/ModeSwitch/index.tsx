"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";

import type { PlayerSectionId } from "@/components/Header/Filters/player-sections";

import styles from "./styles.module.scss";

type Item = { id: PlayerSectionId; name: string };

const ease = "power3.easeOut";

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
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const hoverLabelRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const tweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (reduce) return;

    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const { width: w, height: h } = pill.getBoundingClientRect();
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta =
          Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = labelRefs.current[index];
        const hover = hoverLabelRefs.current[index];
        if (label) gsap.set(label, { y: 0 });
        if (hover) gsap.set(hover, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(
          circle,
          { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" },
          0,
        );
        if (label) {
          tl.to(
            label,
            { y: -(h + 8), duration: 2, ease, overwrite: "auto" },
            0,
          );
        }
        if (hover) {
          gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(
            hover,
            { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" },
            0,
          );
        }
        tlRefs.current[index] = tl;
        tl.progress(items[index]?.id === valueRef.current ? 1 : 0);
      });
    };

    layout();
    window.addEventListener("resize", layout);
    const fonts = document.fonts?.ready.then(layout).catch(() => undefined);

    return () => {
      window.removeEventListener("resize", layout);
      void fonts;
      tlRefs.current.forEach((tl) => tl?.kill());
      tweenRefs.current.forEach((tween) => tween?.kill());
    };
  }, [items, reduce]);

  useEffect(() => {
    if (reduce) return;

    items.forEach((item, index) => {
      const tl = tlRefs.current[index];
      if (!tl) return;
      tweenRefs.current[index]?.kill();
      tweenRefs.current[index] = tl.tweenTo(
        item.id === value ? tl.duration() : 0,
        { duration: reduce ? 0 : 0.3, ease, overwrite: "auto" },
      );
    });
  }, [items, reduce, value]);

  const play = (index: number, toEnd: boolean) => {
    if (reduce) return;
    const tl = tlRefs.current[index];
    if (!tl) return;
    tweenRefs.current[index]?.kill();
    tweenRefs.current[index] = tl.tweenTo(toEnd ? tl.duration() : 0, {
      duration: toEnd ? 0.3 : 0.2,
      ease,
      overwrite: "auto",
    });
  };

  return (
    <nav className={styles.nav} aria-label="Player sections">
      {items.map((item, index) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={active ? `${styles.pill} ${styles.pillActive}` : styles.pill}
            aria-current={active ? "true" : undefined}
            onClick={() => onChange(item.id)}
            onMouseEnter={() => play(index, true)}
            onMouseLeave={() => {
              if (valueRef.current !== item.id) play(index, false);
            }}
          >
            <span ref={(el) => { circleRefs.current[index] = el; }} className={styles.circle} />
            <span className={styles.stack}>
              <span
                ref={(el) => { labelRefs.current[index] = el; }}
                className={styles.label}
              >
                {item.name}
              </span>
              <span
                ref={(el) => { hoverLabelRefs.current[index] = el; }}
                className={styles.labelHover}
                aria-hidden
              >
                {item.name}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

"use client";

// Next
import Image from "next/image";

// React
import { useEffect, useRef, useState } from "react";

// Motion
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Types
import type { PublicRosterGalleryImage } from "@/types/roster";

const PLACEHOLDER_SRC = "/assets/images/player-placeholder.png";

export default function PlayerGallery({
  images,
  fallbackSrc,
  playerName,
}: {
  images: PublicRosterGalleryImage[];
  fallbackSrc?: string | null;
  playerName: string;
}) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  const progress = useMotionValue(0);
  const thumbRatio = useMotionValue(1);
  const thumbWidth = useTransform(thumbRatio, (ratio) => `${ratio * 100}%`);
  const thumbLeft = useTransform(
    [progress, thumbRatio],
    ([p, ratio]: number[]) => `${p * (100 - ratio * 100)}%`,
  );

  const sources =
    images.length > 0
      ? images.map((image) => ({ id: image.id, url: image.url }))
      : [
          {
            id: "fallback",
            url: fallbackSrc?.trim() || PLACEHOLDER_SRC,
          },
        ];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const ratio =
        track.scrollWidth > 0 ? track.clientWidth / track.scrollWidth : 1;
      const nextScrollable = max > 2;
      setScrollable(nextScrollable);
      thumbRatio.set(Math.min(1, Math.max(ratio, 0.12)));
      progress.set(max > 0 ? track.scrollLeft / max : 0);
    };

    update();
    track.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    for (const child of track.children) {
      if (child instanceof HTMLElement) observer.observe(child);
    }

    return () => {
      track.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [progress, sources.length, thumbRatio]);

  const seek = (clientX: number, target: HTMLElement) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = target.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const max = track.scrollWidth - track.clientWidth;
    track.scrollTo({
      left: ratio * max,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <div className={styles.container}>
      <div ref={trackRef} className={styles.track}>
        {sources.map((source, index) => (
          <figure key={source.id} className={styles.card}>
            <Image
              className={styles.image}
              src={source.url}
              alt={`${playerName} gallery ${index + 1}`}
              width={1600}
              height={2000}
              sizes="50vw"
              style={{ height: "100%", width: "auto" }}
              priority={index === 0}
              draggable={false}
            />
          </figure>
        ))}
      </div>

      {scrollable ? (
        <button
          type="button"
          className={styles.progress}
          aria-label="Gallery scroll position"
          onClick={(event) => seek(event.clientX, event.currentTarget)}
        >
          <motion.span
            className={styles.progressThumb}
            style={{
              width: thumbWidth,
              left: thumbLeft,
            }}
          />
        </button>
      ) : null}
    </div>
  );
}

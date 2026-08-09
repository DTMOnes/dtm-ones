"use client";

// Next
import Image from "next/image";

// React
import { useEffect, useRef, useState } from "react";

// Motion
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// Icons
import { CaretLeft, CaretRight, Play } from "@phosphor-icons/react";

// Styles
import styles from "./styles.module.scss";

// Types
import type { PublicRosterVideo } from "@/types/roster";

// Utils
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  parseYouTubeVideoId,
} from "@/utils/youtube";

type HighlightItem = {
  id: string;
  videoId: string;
};

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function PlayerHighlights({
  videos,
  playerName,
}: {
  videos: PublicRosterVideo[];
  playerName: string;
}) {
  const reduce = useReducedMotion();
  const items: HighlightItem[] = [];
  for (const video of videos) {
    const videoId = parseYouTubeVideoId(video.youtube_url);
    if (!videoId) continue;
    items.push({ id: video.id, videoId });
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [slideDir, setSlideDir] = useState(0);
  const activeIndexRef = useRef(activeIndex);

  activeIndexRef.current = activeIndex;

  const canPager = items.length > 1;
  const thumbRatio = canPager ? 1 / items.length : 1;

  const selectClip = (index: number) => {
    if (index === activeIndexRef.current) return;
    setSlideDir(index > activeIndexRef.current ? 1 : -1);
    setActiveIndex(index);
    setPlaying(false);
  };

  const step = (delta: number) => {
    if (!canPager) return;
    const current = activeIndexRef.current;
    selectClip((current + delta + items.length) % items.length);
  };

  useEffect(() => {
    if (!canPager) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const current = activeIndexRef.current;
      const next = (current + delta + items.length) % items.length;
      if (next === current) return;
      setSlideDir(delta);
      setActiveIndex(next);
      setPlaying(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canPager, items.length]);

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No highlights</p>
      </div>
    );
  }

  const active = items[activeIndex] ?? items[0];

  const seek = (clientX: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (clientX - rect.left) / rect.width),
    );
    selectClip(Math.min(items.length - 1, Math.floor(ratio * items.length)));
  };

  return (
    <div className={styles.container}>
      <div className={styles.cinema}>
        <div className={styles.ratio}>
          <AnimatePresence mode="wait" custom={slideDir}>
            {playing ? (
              <motion.div
                key={`play-${active.id}`}
                className={styles.frame}
                custom={slideDir}
                initial={
                  reduce
                    ? false
                    : { opacity: 0, x: slideDir === 0 ? 0 : slideDir * 36 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  reduce
                    ? undefined
                    : { opacity: 0, x: slideDir === 0 ? 0 : slideDir * -36 }
                }
                transition={{ duration: 0.3, ease: easeOut }}
              >
                <iframe
                  className={styles.video}
                  src={getYouTubeEmbedUrl(active.videoId, {
                    autoplay: true,
                    mute: false,
                  })}
                  title={`${playerName} highlight ${activeIndex + 1}`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </motion.div>
            ) : (
              <motion.button
                key={`poster-${active.id}`}
                type="button"
                className={styles.poster}
                aria-label={`Play highlight ${activeIndex + 1}`}
                onClick={() => setPlaying(true)}
                custom={slideDir}
                initial={
                  reduce
                    ? false
                    : { opacity: 0, x: slideDir === 0 ? 0 : slideDir * 36 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  reduce
                    ? undefined
                    : { opacity: 0, x: slideDir === 0 ? 0 : slideDir * -36 }
                }
                transition={{ duration: 0.35, ease: easeOut }}
                whileHover={reduce ? undefined : { scale: 1.01 }}
                whileTap={reduce ? undefined : { scale: 0.99 }}
              >
                <Image
                  className={styles.posterImage}
                  src={getYouTubeThumbnailUrl(active.videoId)}
                  alt=""
                  width={1280}
                  height={720}
                  sizes="(max-width: 900px) 92vw, min(100vw, 1200px)"
                  priority
                  draggable={false}
                />
                <span className={styles.play} aria-hidden>
                  <Play weight="fill" size={28} />
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {canPager ? (
            <>
              <button
                type="button"
                className={`${styles.nav} ${styles.navPrev}`}
                aria-label="Previous highlight"
                onClick={() => step(-1)}
              >
                <CaretLeft weight="bold" size={22} />
              </button>
              <button
                type="button"
                className={`${styles.nav} ${styles.navNext}`}
                aria-label="Next highlight"
                onClick={() => step(1)}
              >
                <CaretRight weight="bold" size={22} />
              </button>
              <button
                type="button"
                className={styles.index}
                aria-label={`Highlight ${activeIndex + 1} of ${items.length}`}
                onClick={(event) => seek(event.clientX, event.currentTarget)}
              >
                <motion.span
                  className={styles.indexThumb}
                  animate={{ left: `${activeIndex * thumbRatio * 100}%` }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 32 }
                  }
                  style={{ width: `${thumbRatio * 100}%` }}
                />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

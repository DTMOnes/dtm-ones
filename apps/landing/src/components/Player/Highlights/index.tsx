"use client";

// Next
import Image from "next/image";

// React
import { useCallback, useEffect, useRef, useState } from "react";

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
  showPager = true,
  onPlayingChange,
}: {
  videos: PublicRosterVideo[];
  playerName: string;
  showPager?: boolean;
  onPlayingChange?: (playing: boolean) => void;
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

  const setClipPlaying = useCallback(
    (next: boolean) => {
      setPlaying(next);
      onPlayingChange?.(next);
    },
    [onPlayingChange],
  );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const canPager = items.length > 1;

  const selectClip = (index: number) => {
    if (index === activeIndexRef.current) return;
    setSlideDir(index > activeIndexRef.current ? 1 : -1);
    setActiveIndex(index);
    setClipPlaying(false);
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
      setClipPlaying(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canPager, items.length, setClipPlaying]);

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No highlights</p>
      </div>
    );
  }

  const active = items[activeIndex] ?? items[0];

  return (
    <div className={styles.container}>
      <div className={playing ? `${styles.cinema} ${styles.cinemaPlay}` : styles.cinema}>
        <div className={playing ? styles.ratio : styles.stage}>
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
                onClick={() => setClipPlaying(true)}
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
                  sizes="100vw"
                  priority
                  draggable={false}
                />
                <span className={styles.play} aria-hidden>
                  <Play weight="fill" size={28} />
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {canPager && showPager ? (
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
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

"use client";

// Next
import Image from "next/image";

// React
import { useState } from "react";

// Motion
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// Icons
import { Play } from "@phosphor-icons/react";

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

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No highlights</p>
      </div>
    );
  }

  const active = items[activeIndex] ?? items[0];

  const selectClip = (index: number) => {
    setActiveIndex(index);
    setPlaying(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.cinema}>
        <div className={styles.ratio}>
          <AnimatePresence mode="wait">
            {playing ? (
              <motion.div
                key={`play-${active.id}`}
                className={styles.frame}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
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
                initial={reduce ? false : { opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
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
        </div>
      </div>

      {items.length > 1 ? (
        <div className={styles.strip} role="tablist" aria-label="Highlights index">
          {items.map((item, index) => {
            const selected = index === activeIndex;
            return (
              <motion.button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`Go to highlight ${index + 1}`}
                className={
                  selected
                    ? `${styles.thumb} ${styles.thumbActive}`
                    : styles.thumb
                }
                onClick={() => selectClip(index)}
                whileHover={reduce ? undefined : { opacity: 1, y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
              >
                <Image
                  src={getYouTubeThumbnailUrl(item.videoId)}
                  alt=""
                  width={160}
                  height={90}
                  sizes="120px"
                  draggable={false}
                />
              </motion.button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

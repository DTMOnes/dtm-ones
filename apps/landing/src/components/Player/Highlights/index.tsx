"use client";

// Next
import Image from "next/image";

// React
import { useState } from "react";

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

export default function PlayerHighlights({
  videos,
  playerName,
}: {
  videos: PublicRosterVideo[];
  playerName: string;
}) {
  const items: HighlightItem[] = [];
  for (const video of videos) {
    const videoId = parseYouTubeVideoId(video.youtube_url);
    if (!videoId) continue;
    items.push({ id: video.id, videoId });
  }

  const [activeIndex, setActiveIndex] = useState(0);

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
      <figure className={styles.stage}>
        <iframe
          key={active.id}
          className={styles.video}
          src={getYouTubeEmbedUrl(active.videoId)}
          title={`${playerName} highlight ${activeIndex + 1}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </figure>

      {items.length > 1 ? (
        <div className={styles.index} role="tablist" aria-label="Highlights index">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={`Go to highlight ${index + 1}`}
              className={
                activeIndex === index
                  ? `${styles.thumb} ${styles.thumbActive}`
                  : styles.thumb
              }
              onClick={() => setActiveIndex(index)}
            >
              <Image
                src={getYouTubeThumbnailUrl(item.videoId)}
                alt=""
                width={80}
                height={80}
                sizes="64px"
                draggable={false}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

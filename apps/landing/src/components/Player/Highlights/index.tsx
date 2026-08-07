"use client";

// Next
import Image from "next/image";

// React
import { useEffect, useRef, useState } from "react";

// Styles
import styles from "../Gallery/styles.module.scss";

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

  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    slideRefs.current = slideRefs.current.slice(0, items.length);

    const slides = slideRefs.current.filter(
      (slide): slide is HTMLElement => slide !== null,
    );
    if (slides.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = slides.indexOf(entry.target as HTMLElement);
          if (index < 0) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { index, ratio: entry.intersectionRatio };
          }
        }
        if (best) {
          setActiveIndex(best.index);
        }
      },
      {
        root: track,
        threshold: [0.5, 0.75, 1],
      },
    );

    for (const slide of slides) {
      observer.observe(slide);
    }

    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    thumbRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeIndex]);

  const scrollToIndex = (index: number) => {
    const slide = slideRefs.current[index];
    if (!slide) return;
    slide.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
    setActiveIndex(index);
  };

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No highlights</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div ref={trackRef} className={styles.track}>
        {items.map((item, index) => (
          <figure
            key={item.id}
            ref={(node) => {
              slideRefs.current[index] = node;
            }}
            className={styles.slide}
          >
            {activeIndex === index ? (
              <iframe
                className={styles.video}
                src={getYouTubeEmbedUrl(item.videoId)}
                title={`${playerName} highlight ${index + 1}`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <Image
                className={styles.poster}
                src={getYouTubeThumbnailUrl(item.videoId)}
                alt={`${playerName} highlight ${index + 1}`}
                width={1280}
                height={720}
                sizes="100vw"
                draggable={false}
              />
            )}
          </figure>
        ))}
      </div>

      <div className={styles.index} role="tablist" aria-label="Highlights index">
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              thumbRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-label={`Go to highlight ${index + 1}`}
            className={
              activeIndex === index
                ? `${styles.thumb} ${styles.thumbActive}`
                : styles.thumb
            }
            onClick={() => scrollToIndex(index)}
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
    </div>
  );
}

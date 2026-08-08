"use client";

// Next
import Image from "next/image";

// React
import { useEffect, useRef, useState } from "react";

// Styles
import styles from "./styles.module.scss";

// Types
import type { PublicRosterGalleryImage } from "@/types/roster";

export default function PlayerGallery({
  images,
  playerName,
}: {
  images: PublicRosterGalleryImage[];
  playerName: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || images.length === 0) return;

    slideRefs.current = slideRefs.current.slice(0, images.length);
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
        if (best) setActiveIndex(best.index);
      },
      {
        root: track,
        threshold: [0.5, 0.75, 1],
      },
    );

    for (const slide of slides) observer.observe(slide);
    return () => observer.disconnect();
  }, [images.length]);

  const scrollToIndex = (index: number) => {
    const slide = slideRefs.current[index];
    if (!slide) return;
    slide.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setActiveIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No gallery images</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div ref={trackRef} className={styles.track}>
        {images.map((image, index) => (
          <figure
            key={image.id}
            ref={(node) => {
              slideRefs.current[index] = node;
            }}
            className={styles.slide}
          >
            <Image
              className={styles.image}
              src={image.url}
              alt={`${playerName} gallery ${index + 1}`}
              width={1600}
              height={2000}
              sizes="(max-width: 900px) 100vw, 50vw"
              priority={index === 0}
              draggable={false}
            />
          </figure>
        ))}
      </div>

      {images.length > 1 ? (
        <div className={styles.index} role="tablist" aria-label="Gallery index">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={`Go to image ${index + 1}`}
              className={
                activeIndex === index
                  ? `${styles.marker} ${styles.markerActive}`
                  : styles.marker
              }
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

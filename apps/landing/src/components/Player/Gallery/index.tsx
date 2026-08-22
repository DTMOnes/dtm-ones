"use client";

import { useMemo } from "react";

import MorphSlider from "@/components/MorphSlider";
import type { PublicRosterGalleryImage } from "@/types/roster";

import styles from "./styles.module.scss";

const PLACEHOLDER_SRC = "/assets/images/player-placeholder.png";

export default function PlayerGallery({
  images,
  fallbackSrc,
  playerName,
  showControls = true,
}: {
  images: PublicRosterGalleryImage[];
  fallbackSrc?: string | null;
  playerName: string;
  showControls?: boolean;
}) {
  const items = useMemo(() => {
    const sources =
      images.length > 0
        ? images.map((image) => image.url)
        : [fallbackSrc?.trim() || PLACEHOLDER_SRC];

    return sources.map((image) => ({ image }));
  }, [fallbackSrc, images]);

  const sliderKey = items.map((item) => item.image).join("|");

  return (
    <div className={styles.container}>
      {/* Morph Slider is WebGL textures. YouTube stays in PlayerHighlights so iframe controls are never cropped. */}
      <MorphSlider
        key={sliderKey}
        items={items}
        className={styles.slider}
        radius={0}
        overlayColor="#0f0f0f"
        transition="melt"
        duration={0.9}
        intensity={0.45}
        scale={2.2}
        aberration={0.15}
        drift={0}
        autoplay={false}
        loop={items.length > 1}
        showCaptions={false}
        showIndicators={false}
        showControls={showControls && items.length > 1}
        aria-label={`${playerName} gallery`}
      />
    </div>
  );
}

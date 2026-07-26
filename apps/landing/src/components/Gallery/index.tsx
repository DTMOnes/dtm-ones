"use client";

// React
import { useMemo, useState } from "react";

// Next
import Image from "next/image";

// Styles
import styles from "./styles.module.scss";

// Types
import { PublicRosterPlayer } from "@/types/roster";

// Utils
import { buildGalleryItems, getYouTubeEmbedUrl } from "@/utils/youtube";

export default function Gallery({
  player,
  onClose,
}: {
  player: PublicRosterPlayer;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = useMemo(() => buildGalleryItems(player), [player]);
  const count = items.length;
  const current = count > 0 ? items[currentIndex % count] : null;

  const goPrev = () => {
    if (count === 0) return;
    setCurrentIndex((i) => (i - 1 + count) % count);
  };

  const goNext = () => {
    if (count === 0) return;
    setCurrentIndex((i) => (i + 1) % count);
  };

  if (!current) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>Go back</p>
        <button
          className={styles.button}
          onClick={onClose}
          aria-label="Close gallery"
        >
          <Image
            src="/assets/icons/arrow-u-up-left-bold.svg"
            alt="Close gallery"
            width={24}
            height={24}
          />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.stage}>
        {current.kind === "image" ? (
          <Image
            className={styles.gallery_image}
            src={current.url}
            alt={player.full_name}
            width={1280}
            height={720}
            draggable={false}
            priority
          />
        ) : (
          <iframe
            key={current.id}
            className={styles.gallery_video}
            src={getYouTubeEmbedUrl(current.videoId)}
            title={`${player.full_name} highlight`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {count > 1 ? (
        <div className={styles.buttons_container}>
          <button
            className={styles.button}
            onClick={onClose}
            aria-label="Close gallery"
          >
            <Image
              src="/assets/icons/arrow-u-up-left-bold.svg"
              alt="Previous"
              width={24}
              height={24}
            />
          </button>

          <div className={styles.gallery_controls}>
            <button
              type="button"
              className={styles.button}
              onClick={goPrev}
              aria-label="Previous media"
            >
              <Image
                src="/assets/icons/caret-left-bold.svg"
                alt="Previous media"
                width={24}
                height={24}
              />
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={goNext}
              aria-label="Next media"
            >
              <Image
                src="/assets/icons/caret-right-bold.svg"
                alt="Next media"
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>
      ) : null}

      <div className={styles.player_info}>
        <div className={styles.player_name}>
          <p>{player.categories[0].name}</p>
          <h1>{player.full_name}</h1>
        </div>

        <div className={styles.player_stats}>
          <div className={styles.player_stats_item}>
            <p>Height</p>
            <h2>185 cm</h2>
          </div>
          <div className={styles.player_stats_item}>
            <p>Nationality</p>
            <h2>Brazil</h2>
          </div>
          <div className={styles.player_stats_item}>
            <p>Last Club</p>
            <h2>Barcelona</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

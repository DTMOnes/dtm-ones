"use client";

// Next
import Image from "next/image";

// React
import { useMemo, useState } from "react";

// Motion
import { motion, AnimatePresence } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Types
import { PublicRosterPlayer } from "@/types/roster";

// Utils
import { buildGalleryItems, getYouTubeEmbedUrl } from "@/utils/youtube";

// Components
import Info from "./Info";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "25%" : "-25%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-25%" : "25%",
    opacity: 0,
  }),
};

export default function Gallery({
  player,
  onClose,
}: {
  player: PublicRosterPlayer;
  onClose: () => void;
}) {
  const [[currentIndex, direction], setSlide] = useState([0, 0]);

  const items = useMemo(() => buildGalleryItems(player), [player]);
  const count = items.length;
  const current = count > 0 ? items[currentIndex % count] : null;

  const goPrev = () => {
    if (count === 0) return;
    setSlide(([i]) => [(i - 1 + count) % count, -1]);
  };
  const goNext = () => {
    if (count === 0) return;
    setSlide(([i]) => [(i + 1) % count, 1]);
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
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.stage}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            className={styles.slide}
            key={current.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.215, 0.61, 0.355, 1] }}
          >
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
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 ? (
        <div className={styles.buttons_container}>
          <button
            className={styles.button}
            onClick={onClose}
            aria-label="Close gallery"
          >
            <Image
              className={styles.button_icon}
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
                className={styles.button_icon}
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
                className={styles.button_icon}
                src="/assets/icons/caret-right-bold.svg"
                alt="Next media"
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>
      ) : null}

      <Info player={player} />
    </motion.div>
  );
}

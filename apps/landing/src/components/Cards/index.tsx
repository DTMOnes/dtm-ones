"use client";

// React
import { useEffect, useRef } from "react";

// Next
import Image from "next/image";

// Motion
import { motion } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Types
import { PublicRosterPlayer } from "@/types/roster";

const EASE = [0.76, 0, 0.24, 1] as const;

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 0.5,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASE,
    },
  },
} as const;

export default function Cards({
  player,
  reveal,
  onReady,
  onSelect,
}: {
  player: PublicRosterPlayer;
  reveal: boolean;
  onReady: (id: string) => void;
  onSelect: () => void;
}) {
  const imageSrc = player.presentation_image_url ?? "";
  const reportedRef = useRef(false);

  useEffect(() => {
    if (imageSrc !== "") return;
    if (reportedRef.current) return;
    reportedRef.current = true;
    onReady(player.id);
  }, [imageSrc, onReady, player.id]);

  const reportReady = () => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    onReady(player.id);
  };

  return (
    <motion.div
      className={styles.card}
      onClick={onSelect}
      variants={cardVariants}
      whileHover={
        reveal
          ? {
              opacity: 1,
              transition: { duration: 0.3, delay: 0, ease: EASE },
            }
          : undefined
      }
    >
      {imageSrc ? (
        <Image
          className={styles.image}
          src={imageSrc}
          alt={player.full_name}
          fill
          draggable={false}
          onLoadingComplete={reportReady}
          onError={reportReady}
        />
      ) : null}

      <div className={styles.card_description}>
        <h1 className={styles.player_name}>{player.full_name}</h1>
        <p className={styles.player_position}>{player.categories[0].name}</p>
      </div>
    </motion.div>
  );
}

"use client";

// Next
import Image from "next/image";

// Motion
import { motion } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Types
import { PublicRosterPlayer } from "@/types/roster";

const EASE = [0.76, 0, 0.24, 1] as const;

export default function Cards({ player }: { player: PublicRosterPlayer }) {
  const imageSrc = player.presentation_image_url ?? "";

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      whileHover={{ opacity: 1, transition: { duration: 0.3 } }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {imageSrc ? (
        <div className={styles.image_container}>
          <Image
            className={styles.image}
            src={imageSrc}
            alt={player.full_name}
            width={1025}
            height={1280}
            draggable={false}
          />
        </div>
      ) : null}

      <div className={styles.card_description}>
        <h1 className={styles.player_name}>{player.full_name}</h1>
        <p className={styles.player_position}>{player.categories[0].name}</p>
      </div>
    </motion.div>
  );
}

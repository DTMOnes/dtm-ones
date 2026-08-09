"use client";

// Next
import Image from "next/image";
import { useRouter } from "next/navigation";

// Motion
import { motion, useReducedMotion, type Variants } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Types
import { PublicRosterPlayer } from "@/types/roster";

const PLACEHOLDER_SRC = "/assets/images/player-placeholder.png";

const easeOut = [0.16, 1, 0.3, 1] as const;

const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 36,
    scale: 0.94,
  },
  enter: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      delay: 0.18 + Math.min(index, 11) * 0.055,
      ease: easeOut,
    },
  }),
  exit: {
    opacity: 0,
    y: 16,
    scale: 0.98,
    transition: {
      duration: 0.28,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const mediaVariants: Variants = {
  initial: { scale: 1.14 },
  enter: (index: number) => ({
    scale: 1,
    transition: {
      duration: 1.05,
      delay: 0.18 + Math.min(index, 11) * 0.055,
      ease: easeOut,
    },
  }),
};

const infoVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  enter: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: 0.32 + Math.min(index, 11) * 0.055,
      ease: easeOut,
    },
  }),
};

export default function Cards({
  player,
  index,
}: {
  player: PublicRosterPlayer;
  index: number;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const imageSrc = player.presentation_image_url?.trim() || PLACEHOLDER_SRC;
  const categoryName = player.categories[0]?.name ?? "";

  const handleNavigate = () => {
    router.push(`/players/${player.id}`);
  };

  return (
    <motion.div
      className={styles.card}
      onClick={handleNavigate}
      custom={index}
      variants={reduce ? undefined : cardVariants}
      initial={reduce ? false : "initial"}
      animate="enter"
      exit="exit"
    >
      <div className={styles.media}>
        <motion.div
          className={styles.media_inner}
          custom={index}
          variants={reduce ? undefined : mediaVariants}
          initial={reduce ? false : "initial"}
          animate="enter"
        >
          <Image
            className={styles.image}
            src={imageSrc}
            alt={player.full_name}
            width={1025}
            height={1280}
            draggable={false}
          />
        </motion.div>
      </div>
      <motion.div
        className={styles.player_info}
        custom={index}
        variants={reduce ? undefined : infoVariants}
        initial={reduce ? false : "initial"}
        animate="enter"
      >
        <h2 className={styles.player_name}>{player.full_name}</h2>
        {categoryName ? (
          <p className={styles.player_position}>{categoryName}</p>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

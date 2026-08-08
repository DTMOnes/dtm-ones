"use client";

// Next
import Image from "next/image";
import { useRouter } from "next/navigation";

// Motion
import { motion } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Types
import { PublicRosterPlayer } from "@/types/roster";

const PLACEHOLDER_SRC = "/assets/images/player-placeholder.png";

// delay: index % 2 === 0 ? 0.5 : 1,

const variants = {
  initial: {
    opacity: 0,
    rotateX: 90,
  },
  enter: (index: number) => ({
    opacity: 1,
    rotateX: 0,                 
    transition: {
      duration: 0.65,
      delay: 0.5 + index * 0.1,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  }),
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: [0.76, 0, 0.24, 1],
    },
  },
} as const;

export default function Cards({
  player,
  index,
}: {
  player: PublicRosterPlayer;
  index: number;
}) {
  const router = useRouter();

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
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <Image
        className={styles.image}
        src={imageSrc}
        alt={player.full_name}
        width={1025}
        height={1280}
        draggable={false}
      />
      <div className={styles.player_info}>
        <h2 className={styles.player_name}>{player.full_name}</h2>
        {categoryName ? (
          <p className={styles.player_position}>{categoryName}</p>
        ) : null}
      </div>
    </motion.div>
  );
}

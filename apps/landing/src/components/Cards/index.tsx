"use client";

// Next
import Image from "next/image";
import Link from "next/link";

// Motion
import { motion } from "motion/react";

// Icons
import { ArrowUpRightIcon } from "@phosphor-icons/react";

// Styles
import styles from "./styles.module.scss";

// Types
import { PublicRosterPlayer } from "@/types/roster";

const EASE = [0.76, 0, 0.24, 1] as const;
const PLACEHOLDER_SRC = "/assets/images/player-placeholder.png";

export default function Cards({ player }: { player: PublicRosterPlayer }) {
  const imageSrc =
    player.presentation_image_url?.trim() || PLACEHOLDER_SRC;
  const categoryName = player.categories[0]?.name ?? "";
  const lastClub = player.last_club.trim();

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
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

      <div className={styles.default_meta}>
        <h2 className={styles.player_name}>{player.full_name}</h2>
        {categoryName ? (
          <p className={styles.player_position}>{categoryName}</p>
        ) : null}
      </div>

      <div className={styles.hover_panel}>
        <div className={styles.hover_header}>
          <div className={styles.hover_identity}>
            <h2 className={styles.player_name}>{player.full_name}</h2>
            {categoryName ? (
              <p className={styles.player_position}>{categoryName}</p>
            ) : null}
          </div>
          <Image
            className={styles.ball_icon}
            src="/assets/svg/dtm-ones-ball.svg"
            alt=""
            width={28}
            height={23}
            draggable={false}
          />
        </div>

        <div className={styles.stats}>
          <div className={styles.stat_row}>
            <span className={styles.stat_label}>Height</span>
            <span className={styles.stat_value}>{player.height_cm} CM</span>
          </div>
          <div className={styles.stat_row}>
            <span className={styles.stat_label}>Nationality</span>
            <span className={styles.stat_value}>{player.nationality}</span>
          </div>
          <div className={styles.stat_row}>
            <span className={styles.stat_label}>Last Club</span>
            <span className={styles.stat_value}>
              {lastClub.length > 0 ? lastClub : "—"}
            </span>
          </div>
        </div>

        <Link href={`/roster/${player.slug}`} className={styles.cta}>
          View Profile
          <ArrowUpRightIcon size={16} weight="bold" aria-hidden />
        </Link>
      </div>
    </motion.div>
  );
}

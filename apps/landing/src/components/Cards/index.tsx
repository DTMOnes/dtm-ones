"use client";

// Next
import Image from "next/image";
import Link from "next/link";

// React
import { useState } from "react";

// Motion
import { motion, useReducedMotion } from "motion/react";

// Icons
import { ArrowUpRightIcon } from "@phosphor-icons/react";

// Styles
import styles from "./styles.module.scss";

// Types
import { PublicRosterPlayer } from "@/types/roster";

const EASE = [0.76, 0, 0.24, 1] as const;
const PLACEHOLDER_SRC = "/assets/images/player-placeholder.png";
const DEFAULT_META_VARIANTS = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 10 },
};
const INFO_PANEL_VARIANTS = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function Cards({
  player,
  isSelected,
  onSelect,
}: {
  player: PublicRosterPlayer;
  isSelected: boolean;
  onSelect: (player: PublicRosterPlayer) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const imageSrc = player.presentation_image_url?.trim() || PLACEHOLDER_SRC;
  const categoryName = player.categories[0]?.name ?? "";
  const lastClub = player.last_club.trim();
  const isRevealed = isSelected || isHovered;
  const revealTransition = {
    duration: shouldReduceMotion ? 0 : 0.35,
    ease: EASE,
  };

  return (
    <motion.article
      className={styles.card}
      data-selected={isSelected}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: EASE,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <button
        type="button"
        className={styles.reveal_button}
        aria-label={`${isSelected ? "Hide" : "Show"} details for ${player.full_name}`}
        aria-expanded={isSelected}
        aria-controls={`player-details-${player.id}`}
        onPointerUp={(event) => {
          if (event.pointerType !== "mouse") {
            setIsSelected((selected) => !selected);
          }
        }}
        onClick={(event) => {
          if (event.detail === 0) {
            setIsSelected((selected) => !selected);
          }
        }}
      />

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

      <motion.div
        className={styles.default_meta}
        variants={DEFAULT_META_VARIANTS}
        initial="visible"
        animate={isRevealed ? "hidden" : "visible"}
        transition={revealTransition}
        aria-hidden={isRevealed}
      >
        <h2 className={styles.player_name}>{player.full_name}</h2>
        {categoryName ? (
          <p className={styles.player_position}>{categoryName}</p>
        ) : null}
      </motion.div>

      <motion.div
        id={`player-details-${player.id}`}
        className={styles.hover_panel}
        variants={INFO_PANEL_VARIANTS}
        initial="hidden"
        animate={isRevealed ? "visible" : "hidden"}
        transition={revealTransition}
        data-visible={isRevealed}
        aria-hidden={!isRevealed}
        inert={!isRevealed}
      >
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
      </motion.div>
    </motion.article>
  );
}

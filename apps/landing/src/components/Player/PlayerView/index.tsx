"use client";

// React
import { useState } from "react";

// Motion
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Types
import type { PublicRosterPlayer } from "@/types/roster";
import {
  PLAYER_SECTIONS,
  type PlayerSectionId,
} from "@/components/Header/Filters/player-sections";

// Components
import PlayerGallery from "@/components/Player/Gallery";
import PlayerHighlights from "@/components/Player/Highlights";

const easeOut = [0.16, 1, 0.3, 1] as const;

const chromeVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

export default function PlayerView({ player }: { player: PublicRosterPlayer }) {
  const reduce = useReducedMotion();
  const [section, setSection] = useState<PlayerSectionId>("gallery");
  const categoryName = player.categories[0]?.name ?? "";
  const lastClub = player.last_club.trim();

  return (
    <main className={styles.main}>
      <div className={styles.media} aria-live="polite">
        <motion.nav
          className={styles.modes}
          aria-label="Player sections"
          variants={reduce ? undefined : itemVariants}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          {PLAYER_SECTIONS.map((item) => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={
                  active ? `${styles.mode} ${styles.modeActive}` : styles.mode
                }
                aria-current={active ? "true" : undefined}
                onClick={() => setSection(item.id)}
              >
                {item.name}
                {active ? (
                  <motion.span
                    className={styles.modeMark}
                    layoutId={reduce ? undefined : "player-mode-mark"}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
              </button>
            );
          })}
        </motion.nav>

        <AnimatePresence mode="wait">
          {section === "gallery" ? (
            <motion.div
              key="gallery"
              className={styles.mediaPane}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35, ease: easeOut }}
            >
              <PlayerGallery
                images={player.gallery_images}
                fallbackSrc={player.presentation_image_url}
                playerName={player.full_name}
              />
            </motion.div>
          ) : (
            <motion.div
              key="highlights"
              className={styles.mediaPane}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35, ease: easeOut }}
            >
              <PlayerHighlights
                videos={player.videos}
                playerName={player.full_name}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className={styles.dock}
        variants={reduce ? undefined : chromeVariants}
        initial={reduce ? false : "hidden"}
        animate="show"
      >
        <motion.div
          className={styles.identity}
          variants={reduce ? undefined : itemVariants}
        >
          {categoryName ? (
            <p className={styles.category}>{categoryName}</p>
          ) : null}
          <h1 className={styles.name}>{player.full_name}</h1>
        </motion.div>

        <motion.dl
          className={styles.stats}
          variants={reduce ? undefined : itemVariants}
        >
          <div className={styles.stat}>
            <dt>height</dt>
            <dd>{player.height_cm} cm</dd>
          </div>
          <div className={styles.stat}>
            <dt>nationality</dt>
            <dd>{player.nationality}</dd>
          </div>
          {lastClub.length > 0 ? (
            <div className={styles.stat}>
              <dt>last club</dt>
              <dd>{lastClub}</dd>
            </div>
          ) : null}
        </motion.dl>
      </motion.div>
    </main>
  );
}

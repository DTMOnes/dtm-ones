"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  PLAYER_SECTIONS,
  type PlayerSectionId,
} from "@/components/Header/Filters/player-sections";
import PlayerGallery from "@/components/Player/Gallery";
import PlayerHighlights from "@/components/Player/Highlights";
import PlayerInfo, { PlayerInfoPanel } from "@/components/Player/Info";
import PlayerModeSwitch from "@/components/Player/ModeSwitch";
import type { PublicRosterPlayer } from "@/types/roster";

import styles from "./styles.module.scss";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function PlayerView({ player }: { player: PublicRosterPlayer }) {
  const reduce = useReducedMotion();
  const [section, setSection] = useState<PlayerSectionId>("gallery");
  const [infoOpen, setInfoOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  const showDock = !(section === "highlights" && playing);

  return (
    <main className={styles.main}>
      <div className={styles.media} aria-live="polite">
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
                showControls={!infoOpen}
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
                showPager={!infoOpen}
                onPlayingChange={(next) => {
                  setPlaying(next);
                  if (next) setInfoOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showDock ? <div className={styles.scrim} aria-hidden /> : null}

      <AnimatePresence>
        {showDock && infoOpen ? (
          <PlayerInfoPanel
            key="player-info"
            player={player}
            onClose={() => setInfoOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <div className={styles.chrome}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut, delay: 0.08 }}
        >
          <PlayerModeSwitch
            items={PLAYER_SECTIONS}
            value={section}
            onChange={(id) => {
              setSection(id);
              setPlaying(false);
            }}
          />
        </motion.div>

        {showDock ? (
          <motion.div
            className={styles.dock}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.12 }}
          >
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{player.full_name}</h1>
              <PlayerInfo open={infoOpen} onOpenChange={setInfoOpen} />
            </div>
          </motion.div>
        ) : null}
      </div>
    </main>
  );
}

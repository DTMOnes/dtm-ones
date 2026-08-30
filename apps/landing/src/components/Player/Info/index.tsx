"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Info, X } from "@phosphor-icons/react";

import GlassControl from "@/components/GlassControl";
import SpotlightCard from "@/components/SpotlightCard";
import type { PublicRosterPlayer } from "@/types/roster";

import styles from "./styles.module.scss";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function PlayerInfoPanel({
  player,
  onClose,
}: {
  player: PublicRosterPlayer;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const categoryName =
    player.kind === "coach" ? "Coaches" : player.categories[0]?.name ?? "";
  const lastClub = player.last_club.trim();
  const eurobasket = player.eurobasket_link?.trim() ?? "";

  const stats = [
    player.kind === "player"
      ? { label: "Height", value: `${player.height_cm ?? 0} cm` }
      : null,
    { label: "Nationality", value: player.nationality },
    lastClub.length > 0 ? { label: "Last club", value: lastClub } : null,
  ].filter((item): item is { label: string; value: string } => item !== null);

  return (
    <motion.div
      className={styles.layer}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ duration: 0.3, ease: easeOut }}
    >
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close info"
        onClick={onClose}
      />

      <aside
        id="player-info-card"
        className={styles.stage}
        aria-modal="true"
        aria-label={`${player.full_name} info`}
        role="dialog"
      >
        <SpotlightCard
          className={styles.plate}
          spotlightColor="rgba(255, 255, 255, 0.06)"
        >
          <div className={styles.body}>
            {categoryName || eurobasket.length > 0 ? (
              <div className={styles.meta}>
                {categoryName ? (
                  <p className={styles.category}>{categoryName}</p>
                ) : null}
                {eurobasket.length > 0 ? (
                  <a
                    className={styles.link}
                    href={eurobasket}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Eurobasket
                    <ArrowUpRight size={14} weight="bold" aria-hidden />
                  </a>
                ) : null}
              </div>
            ) : null}

            <dl className={styles.stats} data-count={stats.length}>
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </SpotlightCard>
      </aside>
    </motion.div>
  );
}

export default function PlayerInfo({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  return (
    <GlassControl
      variant="pill"
      className={styles.trigger}
      aria-expanded={open}
      aria-controls="player-info-card"
      onClick={() => onOpenChange(!open)}
    >
      {open ? <X size={18} weight="bold" /> : <Info size={18} weight="bold" />}
      <span>{open ? "Close" : "Info"}</span>
    </GlassControl>
  );
}

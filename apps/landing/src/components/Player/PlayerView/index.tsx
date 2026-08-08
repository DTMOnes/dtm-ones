"use client";

// React
import { useState } from "react";

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

const DESCRIPTION_PLACEHOLDER = (
  <>
    Ala-pivot con recorrido en <strong>Liga Nacional</strong> y experiencia
    internacional reciente en <strong>IBL Indonesia</strong>. Fuerte bajo el
    aro, buena movilidad para su altura.
  </>
);

export default function PlayerView({ player }: { player: PublicRosterPlayer }) {
  const [section, setSection] = useState<PlayerSectionId>("gallery");
  const categoryName = player.categories[0]?.name ?? "";

  return (
    <main className={styles.main}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <header className={styles.intro}>
            <h1 className={styles.name}>{player.full_name}</h1>
            {categoryName ? (
              <p className={styles.category}>{categoryName}</p>
            ) : null}
          </header>

          <p className={styles.description}>{DESCRIPTION_PLACEHOLDER}</p>

          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>Height</dt>
              <dd>{player.height_cm} cm</dd>
            </div>
            <div className={styles.stat}>
              <dt>Nationality</dt>
              <dd>{player.nationality}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Last Club</dt>
              <dd>Quimsa</dd>
            </div>
          </dl>
        </div>

        <nav className={styles.sections} aria-label="Player sections">
          {PLAYER_SECTIONS.map((item) => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={
                  active ? `${styles.section} ${styles.sectionActive}` : styles.section
                }
                aria-current={active ? "true" : undefined}
                onClick={() => setSection(item.id)}
              >
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className={styles.media}>
        {section === "gallery" ? (
          <PlayerGallery
            images={player.gallery_images}
            playerName={player.full_name}
          />
        ) : null}
        {section === "highlights" ? (
          <PlayerHighlights
            videos={player.videos}
            playerName={player.full_name}
          />
        ) : null}
      </div>
    </main>
  );
}

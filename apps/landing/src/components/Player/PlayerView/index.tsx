"use client";

// React
import { useState } from "react";

// Styles
import styles from "./styles.module.scss";

// Types
import type { PublicRosterPlayer } from "@/types/roster";
import type { PlayerSectionId } from "@/components/Header/Filters/player-sections";
import { PLAYER_SECTIONS } from "@/components/Header/Filters/player-sections";

// Components
import Header from "@/components/Header";
import Logo from "@/components/Header/Logo";
import Filters from "@/components/Header/Filters";
import PlayerGallery from "@/components/Player/Gallery";
import PlayerHighlights from "@/components/Player/Highlights";
import PlayerInfo from "@/components/Player/Info";

export default function PlayerView({ player }: { player: PublicRosterPlayer }) {
  const [section, setSection] = useState<PlayerSectionId>("gallery");

  return (
    <>
      <Header
        brand={<Logo title={player.full_name} />}
        filters={
          <Filters
            items={[...PLAYER_SECTIONS]}
            variant="sections"
            name="section"
            value={section}
            onChange={(id) => setSection(id as PlayerSectionId)}
          />
        }
      />

      <main className={styles.main}>
        {section === "gallery" ? (
          <PlayerGallery
            images={player.gallery_images}
            playerName={player.full_name}
          />
        ) : null}
        {section === "highlights" ? <PlayerHighlights /> : null}
        {section === "info" ? <PlayerInfo /> : null}
      </main>
    </>
  );
}

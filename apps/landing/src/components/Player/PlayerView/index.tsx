"use client";

// React
import { useState } from "react";

// Styles
import styles from "./styles.module.scss";

// Types
import type { PublicRosterPlayer } from "@/types/roster";
import type { PlayerSectionId } from "@/components/Header/Filters/player-sections";

// Hooks
import { usePlayerHeader } from "@/components/Header/usePlayerHeader";

// Components
import PlayerGallery from "@/components/Player/Gallery";
import PlayerHighlights from "@/components/Player/Highlights";
import PlayerInfo from "@/components/Player/Info";

export default function PlayerView({ player }: { player: PublicRosterPlayer }) {
  const [section, setSection] = useState<PlayerSectionId>("gallery");
  usePlayerHeader(player.full_name, section, setSection);

  return (
    <main className={styles.main}>
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
      {section === "info" ? <PlayerInfo /> : null}
    </main>
  );
}

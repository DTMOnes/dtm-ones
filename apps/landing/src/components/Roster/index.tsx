"use client";

// React
import { useState } from "react";

// Motion
import { AnimatePresence } from "motion/react";

// Components
import Canvas from "../Canvas";
import Gallery from "../Gallery";
import Search from "../Search";

// Types
import { PublicRosterPlayer } from "@/types/roster";

export default function Roster({
  players,
}: {
  players: PublicRosterPlayer[];
}) {
  const [selectedPlayer, setSelectedPlayer] =
    useState<PublicRosterPlayer | null>(null);

  // Remount the canvas whenever the result set changes so the drag plane
  // recenters and the reveal animation replays.
  const canvasKey = players.map((player) => player.id).join(",") || "empty";

  return (
    <>
      <Canvas key={canvasKey} players={players} onSelect={setSelectedPlayer} />

      <Search hidden={selectedPlayer !== null} />

      <AnimatePresence>
        {selectedPlayer && (
          <Gallery
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

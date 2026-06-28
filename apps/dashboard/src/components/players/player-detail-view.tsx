"use client";

// Components
import PlayerProfileTabs from "@/components/players/player-profile-tabs";

// Types
import type { ApiCategoryWithCount, ApiPlayer } from "@/lib/api/types";

export default function PlayerDetailView({
  player,
  categories,
}: {
  player: ApiPlayer;
  categories: ApiCategoryWithCount[];
}) {
  return (
    <main className="p-10 flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{player.full_name}</h1>
          <p className="text-sm text-muted-foreground">Ficha del jugador</p>
        </div>
      </div>

      <PlayerProfileTabs player={player} categories={categories} />
    </main>
  );
}

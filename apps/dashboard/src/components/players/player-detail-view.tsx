"use client";

import PlayerProfileTabs from "@/components/players/player-profile-tabs";
import type { CategoryWithCount } from "@/types/category";
import type { PlayerDetail } from "@/types/player";

export default function PlayerDetailView({
  player,
  categories,
}: {
  player: PlayerDetail;
  categories: CategoryWithCount[];
}) {
  return (
    <main className="p-10 flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{player.full_name}</h1>
          <p className="text-sm text-muted-foreground">Player profile</p>
        </div>
      </div>

      <PlayerProfileTabs player={player} categories={categories} />
    </main>
  );
}

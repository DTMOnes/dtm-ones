"use client";

import DeletePlayerCard from "@/components/players/delete-player-card";
import EditPlayerForm from "@/components/players/edit-player-form";
import PlayerMedia from "@/components/players/media/player-media";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CategoryWithCount } from "@/types/category";
import type { PlayerDetail } from "@/types/player";

export default function PlayerProfileTabs({
  player,
  categories,
}: {
  player: PlayerDetail;
  categories: CategoryWithCount[];
}) {
  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <Tabs defaultValue="general-info" className="flex w-full flex-col gap-6">
      <TabsList variant="line" className="w-full border-b">
        <TabsTrigger value="general-info">General Info</TabsTrigger>
        <TabsTrigger value="player-media">Player Media</TabsTrigger>
      </TabsList>
      <TabsContent value="general-info" className="flex flex-col gap-6">
        <EditPlayerForm player={player} categories={categoryOptions} />
        <DeletePlayerCard playerId={player.id} fullName={player.full_name} />
      </TabsContent>
      <TabsContent value="player-media">
        <PlayerMedia player={player} />
      </TabsContent>
    </Tabs>
  );
}

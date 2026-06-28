"use client";

// Types
import type { ApiPlayer } from "@/lib/api/types";

// Shadcn
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components
import EditPlayerForm from "@/components/players/edit-player-form";
import DeletePlayerCard from "@/components/players/delete-player-card";
import PlayerMedia from "@/components/players/media/player-media";

export default function PlayerProfileTabs({
  player,
  categories,
}: {
  player: ApiPlayer;
  categories: Array<{ id: string; name: string }>;
}) {
  return (
    <Tabs defaultValue="general-info" className="flex w-full flex-col gap-6">
      <TabsList variant="line" className="w-full border-b">
        <TabsTrigger value="general-info">General Info</TabsTrigger>
        <TabsTrigger value="player-media">Player Media</TabsTrigger>
      </TabsList>
      <TabsContent value="general-info" className="flex flex-col gap-6">
        <EditPlayerForm player={player} categories={categories} />
        <DeletePlayerCard playerId={player.id} fullName={player.full_name} />
      </TabsContent>
      <TabsContent value="player-media">
        <PlayerMedia player={player} />
      </TabsContent>
    </Tabs>
  );
}

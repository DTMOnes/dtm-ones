"use client";

// Types
import type { PlayerData } from "@/lib/validation/players";
import type { CategoryData } from "@/lib/validation/categories";

// Shadcn
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components
import PlayerGeneralInfo from "@/components/players/player-general-info";
import PlayerMedia from "@/components/players/player-media";

export default function PlayerProfileTabs({
  player,
  categories,
}: {
  player: PlayerData;
  categories: CategoryData[];
}) {
  return (
    <Tabs defaultValue="general-info" className="flex w-full flex-col gap-6">
      <TabsList variant="line" className="w-full border-b">
        <TabsTrigger value="general-info">General Info</TabsTrigger>
        <TabsTrigger value="player-media">Player Media</TabsTrigger>
      </TabsList>
      <TabsContent value="general-info">
        <PlayerGeneralInfo player={player} categories={categories} />
      </TabsContent>
      <TabsContent value="player-media">
        <PlayerMedia player={player} />
      </TabsContent>
    </Tabs>
  );
}

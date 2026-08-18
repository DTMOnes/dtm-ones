import { notFound } from "next/navigation";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { schema } from "@dtm/database";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

import { EditPlayerForm } from "@/components/players/edit-player-form";
import { PlayerMedia } from "@/components/players/media/player-media";
import { PlayerVisibilityCard } from "@/components/players/player-visibility-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { getPlayer, playerCompletenessGaps } from "@/utils/players";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [player, categories] = await Promise.all([
    getPlayer(db, id),
    db.query.categories.findMany({
      columns: {
        id: true,
        name: true,
      },
      orderBy: [asc(schema.categories.name)],
    }),
  ]);

  if (!player) {
    notFound();
  }

  const isPublic = player.visibility === "public";

  return (
    <main className="flex h-full w-full flex-col gap-8 p-10">
      <div className="flex flex-col gap-4">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/players">
            <ArrowLeftIcon />
            Players
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{player.name}</h1>
            <Badge variant={isPublic ? "default" : "secondary"}>
              {isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">Player profile</p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        <EditPlayerForm player={player} categories={categories} />
        <PlayerVisibilityCard
          player={player}
          gaps={playerCompletenessGaps(player)}
        />
        <PlayerMedia player={player} />
      </div>
    </main>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { schema } from "@dtm/database";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";

import { EditPlayerForm } from "@/components/players/edit-player-form";
import { PlayerMedia } from "@/components/players/media/player-media";
import { PlayerDetailTabs } from "@/components/players/player-detail-tabs";
import { PlayerVisibilityCard } from "@/components/players/player-visibility-card";
import { RemoveToTrashCard } from "@/components/trash/remove-to-trash-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { getPlayer, playerCompletenessGaps } from "@/utils/players";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const tab = sp.tab === "media" ? "media" : "info";

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
    <main className="flex h-full w-full flex-col gap-8 p-6 md:p-10">
      <div className="flex flex-col gap-3">
        <Button asChild variant="ghost" className="text-muted-foreground w-fit">
          <Link href="/players">
            <ArrowLeftIcon />
            Players
          </Link>
        </Button>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold break-words">{player.name}</h1>
            <Badge variant={isPublic ? "default" : "secondary"}>
              {isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">Player profile</p>
        </div>
      </div>

      <PlayerDetailTabs
        playerId={player.id}
        tab={tab}
        info={
          <>
            <EditPlayerForm player={player} categories={categories} />
            <div className="flex flex-col gap-4">
              <PlayerVisibilityCard
                player={player}
                gaps={playerCompletenessGaps(player)}
              />
              <RemoveToTrashCard clientId={player.id} kind="player" />
            </div>
          </>
        }
        media={<PlayerMedia player={player} />}
      />
    </main>
  );
}

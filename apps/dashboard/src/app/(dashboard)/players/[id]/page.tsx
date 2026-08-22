import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { schema } from "@dtm/database";

import {
  DetailLayout,
  PageHeader,
  PageShell,
} from "@/components/page/page-frame";
import { EditPlayerForm } from "@/components/players/edit-player-form";
import { PlayerMedia } from "@/components/players/media/player-media";
import { PlayerDetailTabs } from "@/components/players/player-detail-tabs";
import { PlayerVisibilityCard } from "@/components/players/player-visibility-card";
import { RemoveToTrashCard } from "@/components/trash/remove-to-trash-card";
import { db } from "@/lib/db";
import { clientDisplayName } from "@/utils/clients";
import { getPlayer, playerCompletenessChecks } from "@/utils/players";

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

  return (
    <PageShell>
      <PageHeader
        backHref="/clients"
        title={clientDisplayName("player", player.name)}
        description="Player profile"
      />

      <PlayerDetailTabs
        basePath={`/players/${player.id}`}
        tab={tab}
        info={
          <DetailLayout
            main={<EditPlayerForm player={player} categories={categories} />}
            rail={
              <>
                <PlayerVisibilityCard
                  player={player}
                  checks={playerCompletenessChecks(player)}
                />
                <RemoveToTrashCard clientId={player.id} kind="player" />
              </>
            }
          />
        }
        media={<PlayerMedia player={player} />}
      />
    </PageShell>
  );
}

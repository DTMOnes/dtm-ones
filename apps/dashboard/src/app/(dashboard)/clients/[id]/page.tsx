import { notFound } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { schema } from "@dtm/database";

import { CoachMedia } from "@/components/coaches/coach-media";
import { CoachVisibilityCard } from "@/components/coaches/coach-visibility-card";
import { EditCoachForm } from "@/components/coaches/edit-coach-form";
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
import { coachCompletenessGaps, getCoach } from "@/utils/coaches";
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
  const basePath = `/clients/${id}`;

  const row = await db.query.clients.findFirst({
    columns: { kind: true },
    where: and(eq(schema.clients.id, id), isNull(schema.clients.trashedAt)),
  });

  if (!row) {
    notFound();
  }

  if (row.kind === "player") {
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
          basePath={basePath}
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

  const coach = await getCoach(db, id);

  if (!coach) {
    notFound();
  }

  const isPublic = coach.visibility === "public";

  return (
    <PageShell>
      <PageHeader
        backHref="/clients"
        title={clientDisplayName("coach", coach.name)}
        description="Coach profile"
        status={isPublic ? "Public" : "Private"}
      />

      <PlayerDetailTabs
        basePath={basePath}
        tab={tab}
        info={
          <DetailLayout
            main={<EditCoachForm coach={coach} />}
            rail={
              <>
                <CoachVisibilityCard
                  coach={coach}
                  gaps={coachCompletenessGaps(coach)}
                />
                <RemoveToTrashCard clientId={coach.id} kind="coach" />
              </>
            }
          />
        }
        media={<CoachMedia coach={coach} />}
      />
    </PageShell>
  );
}

import { notFound } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { schema } from "@dtm/database";

import { ClientCareer } from "@/components/career/client-career";
import {
  EditorLayout,
  ProfileHeader,
  SectionIndex,
} from "@/components/clients/editor-layout";
import { CoachMedia } from "@/components/coaches/coach-media";
import { CoachVisibilityCard } from "@/components/coaches/coach-visibility-card";
import { EditCoachForm } from "@/components/coaches/edit-coach-form";
import { PageShell } from "@/components/page/page-frame";
import { EditPlayerForm } from "@/components/players/edit-player-form";
import { PlayerMedia } from "@/components/players/media/player-media";
import { PlayerDetailTabs } from "@/components/players/player-detail-tabs";
import { PlayerVisibilityCard } from "@/components/players/player-visibility-card";
import { RemoveToTrashCard } from "@/components/trash/remove-to-trash-card";
import { db } from "@/lib/db";
import { getClientCareer } from "@/utils/career";
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
  // Ticks in the section index: the saved profile has that field filled in.
  const filled = (value: string | null | undefined) => Boolean(value?.trim());

  const row = await db.query.clients.findFirst({
    columns: { kind: true },
    where: and(eq(schema.clients.id, id), isNull(schema.clients.trashedAt)),
  });

  if (!row) {
    notFound();
  }

  if (row.kind === "player") {
    const [player, categories, { career, awards }] = await Promise.all([
      getPlayer(db, id),
      db.query.categories.findMany({
        columns: {
          id: true,
          name: true,
        },
        orderBy: [asc(schema.categories.name)],
      }),
      getClientCareer(db, id),
    ]);

    if (!player) {
      notFound();
    }

    const checks = playerCompletenessChecks(player);
    const isPublic = player.visibility === "public";

    return (
      <PageShell>
        <ProfileHeader
          name={clientDisplayName("player", player.name)}
          kind="Player"
          isPublic={isPublic}
          missing={checks.filter((check) => !check.met).length}
          progress={{
            done: checks.filter((check) => check.met).length,
            total: checks.length,
          }}
        />

        <PlayerDetailTabs
          basePath={basePath}
          tab={tab}
          info={
            <EditorLayout
              index={
                <SectionIndex
                  items={[
                    {
                      id: "identity",
                      label: "Identity",
                      done:
                        filled(player.name) &&
                        filled(player.nationality) &&
                        filled(player.birthDate) &&
                        player.heightCm != null,
                    },
                    {
                      id: "basketball",
                      label: "Basketball",
                      done:
                        filled(player.lastClub) &&
                        filled(player.league) &&
                        Boolean(player.categoryId) &&
                        filled(player.eurobasketLink),
                    },
                    {
                      id: "about",
                      label: "About",
                      done:
                        filled(player.bio) &&
                        (player.strengths ?? []).length > 0 &&
                        filled(player.instagramHashtag),
                    },
                    {
                      id: "stats",
                      label: "Statistics",
                      done: filled(player.seasonStats?.season),
                    },
                    { id: "career", label: "Career", done: career.length > 0 },
                    { id: "awards", label: "Titles", done: awards.length > 0 },
                    { id: "visibility", label: "Visibility", done: isPublic },
                  ]}
                />
              }
            >
              <EditPlayerForm player={player} categories={categories} />
              <ClientCareer
                clientId={player.id}
                career={career}
                awards={awards}
                firstNumber={5}
              />
              <PlayerVisibilityCard player={player} checks={checks} number={7} />
              <RemoveToTrashCard clientId={player.id} kind="player" />
            </EditorLayout>
          }
          media={<PlayerMedia player={player} />}
        />
      </PageShell>
    );
  }

  const [coach, { career, awards }] = await Promise.all([
    getCoach(db, id),
    getClientCareer(db, id),
  ]);

  if (!coach) {
    notFound();
  }

  const isPublic = coach.visibility === "public";
  const gaps = coachCompletenessGaps(coach);

  return (
    <PageShell>
      <ProfileHeader
        name={clientDisplayName("coach", coach.name)}
        kind="Coach"
        isPublic={isPublic}
        missing={gaps.length}
      />

      <PlayerDetailTabs
        basePath={basePath}
        tab={tab}
        info={
          <EditorLayout
            index={
              <SectionIndex
                items={[
                  {
                    id: "identity",
                    label: "Identity",
                    done: filled(coach.name) && filled(coach.nationality),
                  },
                  {
                    id: "basketball",
                    label: "Basketball",
                    done:
                      filled(coach.lastClub) &&
                      filled(coach.league) &&
                      filled(coach.eurobasketLink),
                  },
                  {
                    id: "about",
                    label: "About",
                    done: filled(coach.bio) && filled(coach.instagramHashtag),
                  },
                  { id: "career", label: "Career", done: career.length > 0 },
                  { id: "awards", label: "Titles", done: awards.length > 0 },
                  { id: "visibility", label: "Visibility", done: isPublic },
                ]}
              />
            }
          >
            <EditCoachForm coach={coach} />
            <ClientCareer
              clientId={coach.id}
              career={career}
              awards={awards}
              firstNumber={4}
            />
            <CoachVisibilityCard coach={coach} gaps={gaps} number={6} />
            <RemoveToTrashCard clientId={coach.id} kind="coach" />
          </EditorLayout>
        }
        media={<CoachMedia coach={coach} />}
      />
    </PageShell>
  );
}

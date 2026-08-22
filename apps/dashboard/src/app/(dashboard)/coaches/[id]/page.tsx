import { notFound } from "next/navigation";

import { CoachMedia } from "@/components/coaches/coach-media";
import { CoachVisibilityCard } from "@/components/coaches/coach-visibility-card";
import { EditCoachForm } from "@/components/coaches/edit-coach-form";
import {
  DetailLayout,
  PageHeader,
  PageShell,
} from "@/components/page/page-frame";
import { PlayerDetailTabs } from "@/components/players/player-detail-tabs";
import { RemoveToTrashCard } from "@/components/trash/remove-to-trash-card";
import { db } from "@/lib/db";
import { coachCompletenessGaps, getCoach } from "@/utils/coaches";
import { clientDisplayName } from "@/utils/clients";

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
        basePath={`/coaches/${coach.id}`}
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

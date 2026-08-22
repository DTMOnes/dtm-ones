import { notFound } from "next/navigation";

import { CoachVisibilityCard } from "@/components/coaches/coach-visibility-card";
import { EditCoachForm } from "@/components/coaches/edit-coach-form";
import {
  DetailLayout,
  PageHeader,
  PageShell,
} from "@/components/page/page-frame";
import { RemoveToTrashCard } from "@/components/trash/remove-to-trash-card";
import { db } from "@/lib/db";
import { coachCompletenessGaps, getCoach } from "@/utils/coaches";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coach = await getCoach(db, id);

  if (!coach) {
    notFound();
  }

  const isPublic = coach.visibility === "public";

  return (
    <PageShell>
      <PageHeader
        backHref="/coaches"
        backLabel="Coaches"
        title={coach.name ?? ""}
        description="Coach profile"
        status={isPublic ? "Public" : "Private"}
      />

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
    </PageShell>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

import { CoachVisibilityCard } from "@/components/coaches/coach-visibility-card";
import { EditCoachForm } from "@/components/coaches/edit-coach-form";
import { RemoveToTrashCard } from "@/components/trash/remove-to-trash-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <main className="flex h-full w-full flex-col gap-8 p-10">
      <div className="flex flex-col gap-4">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/coaches">
            <ArrowLeftIcon />
            Coaches
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{coach.name}</h1>
            <Badge variant={isPublic ? "default" : "secondary"}>
              {isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">Coach profile</p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        <EditCoachForm coach={coach} />
        <CoachVisibilityCard
          coach={coach}
          gaps={coachCompletenessGaps(coach)}
        />
        <RemoveToTrashCard clientId={coach.id} kind="coach" />
      </div>
    </main>
  );
}

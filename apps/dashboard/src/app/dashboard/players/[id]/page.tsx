// Next
import { notFound } from "next/navigation";

// Db + Drizzle
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Components
import PlayerProfileTabs from "@/components/players/player-profile-tabs";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const player = await db.query.players.findFirst({
    where: eq(players.id, id),
    with: {
      playerCategories: {
        with: {
          category: true,
        },
      },
      playerMedia: true,
    },
  });

  if (!player) {
    notFound();
  }

  const categories = await db.query.categories.findMany();

  return (
    <main className="p-10 flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{player.fullName}</h1>
          <p className="text-sm text-muted-foreground">Ficha del jugador</p>
        </div>
      </div>

      <PlayerProfileTabs player={player} categories={categories} />
    </main>
  );
}

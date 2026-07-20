import { notFound } from "next/navigation";

import PlayerDetailView from "@/components/players/player-detail-view";
import { listCategories } from "@/lib/categories/queries";
import { getPlayerById } from "@/lib/players/queries";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [player, categories] = await Promise.all([
    getPlayerById(id),
    listCategories(""),
  ]);

  if (!player) {
    notFound();
  }

  return <PlayerDetailView player={player} categories={categories} />;
}

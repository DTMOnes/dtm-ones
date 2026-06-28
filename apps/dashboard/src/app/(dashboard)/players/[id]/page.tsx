// Next
import { notFound } from "next/navigation";

// Components
import PlayerDetailView from "@/components/players/player-detail-view";

// Lib
import { ApiError } from "@/lib/api/errors";
import {
  getCategoriesServer,
  getPlayerByIdServer,
} from "@/lib/api/server-queries";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [player, categories] = await Promise.all([
    getPlayerByIdServer(id),
    getCategoriesServer(""),
  ]).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  });

  return <PlayerDetailView player={player} categories={categories} />;
}

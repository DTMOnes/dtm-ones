import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Queries
import { getPublicRosterPlayer } from "@/lib/roster/queries";

// Components
import PlayerView from "@/components/Player/PlayerView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const player = await getPublicRosterPlayer(id);

  if (!player) {
    return { title: "Player | DTM Ones" };
  }

  return {
    title: `${player.full_name} | DTM Ones`,
    description: `Profile for ${player.full_name} at DTM Ones.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPublicRosterPlayer(id);

  if (!player) {
    notFound();
  }

  return <PlayerView player={player} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicRosterPlayer } from "@/lib/roster/queries";
import PlayerView from "@/components/Player/PlayerView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const client = await getPublicRosterPlayer(id);

  if (!client) {
    return { title: "Roster | DTM Ones" };
  }

  return {
    title: `${client.full_name} | DTM Ones`,
    description: `Profile for ${client.full_name} at DTM Ones.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getPublicRosterPlayer(id);

  if (!client) {
    notFound();
  }

  return <PlayerView player={client} />;
}

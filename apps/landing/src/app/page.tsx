import type { Metadata } from "next";

// Components
import Canvas from "@/components/Canvas";

// Utils
import { normalizeSearchParams } from "@/utils/normalize-search-params";

// Queries
import {
  listPublicRosterCategories,
  listPublicRosterPlayers,
} from "@/lib/roster/queries";

export const metadata: Metadata = {
  title: "DTM Ones | The name talent trusts",
  description: "Basketball talent agency built on trust.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string | string[] }>;
}) {
  const sp = await searchParams;
  const { q, c } = normalizeSearchParams(sp);

  const categories = await listPublicRosterCategories();
  const knownByLower = new Map(
    categories.map((category) => [category.id.toLowerCase(), category.id]),
  );
  const categoryIds = c
    .map((id) => knownByLower.get(id.toLowerCase()))
    .filter((id): id is string => id !== undefined);

  const players = await listPublicRosterPlayers({
    q,
    categoryIds,
  });

  const canvasKey =
    players.map((player) => player.id).join(",") || "empty";

  return <Canvas key={canvasKey} players={players} />;
}

import type { Metadata } from "next";
import { Suspense } from "react";

// Components
import Grid from "@/components/Grid";
import GridLoading from "@/components/Grid/Loading";
import HomeRoster from "@/components/Home/Roster";

// Utils
import { normalizeSearchParams } from "@/utils/normalize-search-params";

// Queries
import {
  listPublicRosterCategories,
  listPublicRosterPlayers,
} from "@/lib/roster/queries";

export const metadata: Metadata = {
  description: "Basketball talent agency built on trust.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    c?: string | string[];
    kind?: string | string[];
  }>;
}) {
  const sp = await searchParams;
  const { q, c, kind } = normalizeSearchParams(sp);

  const categories = await listPublicRosterCategories();
  const knownByLower = new Map(
    categories.map((category) => [category.id.toLowerCase(), category.id]),
  );
  const categoryIds = c
    .map((id) => knownByLower.get(id.toLowerCase()))
    .filter((id): id is string => id !== undefined);

  const { clients, hasMore } = await listPublicRosterPlayers({
    q,
    categoryIds,
    kind,
  });

  return (
    <HomeRoster>
      <Suspense fallback={<GridLoading />}>
        <Grid
          key={`${q ?? ""}:${kind ?? ""}:${categoryIds.join(",")}`}
          clients={clients}
          hasMore={hasMore}
          q={q}
          categoryIds={categoryIds}
          kind={kind}
        />
      </Suspense>
    </HomeRoster>
  );
}

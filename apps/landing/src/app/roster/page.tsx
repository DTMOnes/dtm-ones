import type { Metadata } from "next";
import { Suspense } from "react";

import { RosterFilter } from "@/app/roster/_components/roster-filter";
import { PlayerCard } from "@/components/players/player-card";
import {
  normalizeRosterCategories,
  normalizeRosterQ,
} from "@/lib/roster/search-params";
import {
  listPublicRosterCategories,
  listPublicRosterPlayers,
} from "@/lib/roster/queries";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Roster | DTM Ones",
  description:
    "Browse published DTM Ones players. Filter by name and position category.",
};

type RosterPageProps = {
  searchParams: Promise<{ q?: string | string[]; c?: string | string[] }>;
};

export default async function RosterPage({ searchParams }: RosterPageProps) {
  const sp = await searchParams;
  const q = normalizeRosterQ(sp.q);
  const requestedCategoryIds = normalizeRosterCategories(sp.c);

  const categories = await listPublicRosterCategories();
  const knownByLower = new Map(
    categories.map((category) => [category.id.toLowerCase(), category.id]),
  );
  const categoryIds = requestedCategoryIds
    .map((id) => knownByLower.get(id.toLowerCase()))
    .filter((id): id is string => id !== undefined);

  const players = await listPublicRosterPlayers({
    q,
    categoryIds,
  });

  const hasActiveFilters = q !== undefined || categoryIds.length > 0;
  const emptyCopy = hasActiveFilters
    ? "No players match your filters."
    : "No players on the roster yet.";

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>Roster</h1>
          <p className={styles.description}>
            Browse published DTM Ones players. Filter by name and position
            category.
          </p>
        </header>

        <div className={styles.layout}>
          <Suspense fallback={null}>
            <RosterFilter categories={categories} />
          </Suspense>

          {players.length === 0 ? (
            <p className={styles.empty}>{emptyCopy}</p>
          ) : (
            <div className={styles.grid}>
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  slug={player.slug}
                  fullName={player.full_name}
                  presentationImageUrl={player.presentation_image_url}
                  categoryName={player.categories[0]?.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

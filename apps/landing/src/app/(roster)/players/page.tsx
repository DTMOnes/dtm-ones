import type { Metadata } from "next";

import Roster from "@/components/Roster";
import Gate from "@/components/Roster/Gate";
import { hasPlayersAccess } from "@/lib/roster/access";
import { COACHES_FILTER_ID } from "@/lib/roster/constants";
import {
  listPublicRosterCategories,
  listPublicRosterPlayers,
} from "@/lib/roster/queries";
import { normalizeSearchParams } from "@/utils/normalize-search-params";

import styles from "./styles.module.scss";

export const metadata: Metadata = {
  title: "The Team | DTMones",
  description: "Players and Coaches represented by DTMones.",
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
  if (!(await hasPlayersAccess())) {
    return <Gate />;
  }

  const { q, c, kind } = normalizeSearchParams(await searchParams);

  const [categories, coaches] = await Promise.all([
    listPublicRosterCategories(),
    listPublicRosterPlayers({ kind: "coach", limit: 1 }),
  ]);
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

  const filters = [
    ...categories.map(({ id, name }) => ({ id, name })),
    ...(coaches.clients.length > 0
      ? [{ id: COACHES_FILTER_ID, name: "Coaches" }]
      : []),
  ];

  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        <p className="kicker">Roster</p>
        <h1 className={styles.title}>The team</h1>
        <Roster
          filters={filters}
          clients={clients}
          hasMore={hasMore}
          q={q}
          categoryIds={categoryIds}
          kind={kind}
        />
      </div>
    </main>
  );
}

import { Suspense } from "react";

import { normalizePlayerCategoryIds } from "@/components/players/players-search";
import PlayersListView from "@/components/players/players-list-view";
import { Spinner } from "@/components/ui/spinner";
import { listCategories } from "@/lib/categories/queries";
import { listPlayers } from "@/lib/players/queries";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const rawC = sp.c === undefined ? [] : Array.isArray(sp.c) ? sp.c : [sp.c];
  const categoryIds = normalizePlayerCategoryIds(rawC);

  const [players, categories] = await Promise.all([
    listPlayers({ q, categoryIds }),
    listCategories(""),
  ]);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <PlayersListView players={players} categories={categories} />
    </Suspense>
  );
}

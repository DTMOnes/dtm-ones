// React
import { Suspense } from "react";

// React Query
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

// Components
import PlayersListView from "@/components/players/players-list-view";
import { normalizePlayerCategoryIds } from "@/components/players/players-search";
import { Spinner } from "@/components/ui/spinner";

// Lib
import { getQueryClient } from "@/lib/api/get-query-client";
import { queryKeys } from "@/lib/api/query-keys";
import { getCategoriesServer, getPlayersServer } from "@/lib/api/server-queries";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const rawC = sp.c === undefined ? [] : Array.isArray(sp.c) ? sp.c : [sp.c];
  const c = normalizePlayerCategoryIds(rawC);

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.players.list({ q, c }),
      queryFn: () => getPlayersServer({ q, c }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.list(""),
      queryFn: () => getCategoriesServer(""),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <div className="flex min-h-svh items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <PlayersListView />
      </Suspense>
    </HydrationBoundary>
  );
}

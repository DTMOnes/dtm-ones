// React
import { Suspense } from "react";

// React Query
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

// Components
import CategoriesListView from "@/components/categories/categories-list-view";
import { Spinner } from "@/components/ui/spinner";

// Lib
import { getQueryClient } from "@/lib/api/get-query-client";
import { queryKeys } from "@/lib/api/query-keys";
import { getCategoriesServer } from "@/lib/api/server-queries";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.categories.list(q),
    queryFn: () => getCategoriesServer(q),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <div className="flex min-h-svh items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <CategoriesListView />
      </Suspense>
    </HydrationBoundary>
  );
}

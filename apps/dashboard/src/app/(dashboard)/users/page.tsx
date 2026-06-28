// React Query
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

// Components
import UsersListView from "@/components/users/users-list-view";

// Lib
import { getQueryClient } from "@/lib/api/get-query-client";
import { queryKeys } from "@/lib/api/query-keys";
import { getUsersServer } from "@/lib/api/server-queries";

export default async function Page() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.users.list(),
    queryFn: getUsersServer,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersListView />
    </HydrationBoundary>
  );
}

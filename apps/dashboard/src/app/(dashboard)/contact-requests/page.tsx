// React Query
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

// Components
import ContactRequestsListView from "@/components/contact-requests/contact-requests-list-view";

// Lib
import { getQueryClient } from "@/lib/api/get-query-client";
import { queryKeys } from "@/lib/api/query-keys";
import { getContactRequestsServer } from "@/lib/api/server-queries";

export default async function Page() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.contactRequests.list(),
    queryFn: getContactRequestsServer,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContactRequestsListView />
    </HydrationBoundary>
  );
}

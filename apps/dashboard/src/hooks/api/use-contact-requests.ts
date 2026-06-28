"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteContactRequest,
  getContactRequests,
} from "@/lib/api/contact-requests";
import { queryKeys } from "@/lib/api/query-keys";

export function useContactRequestsQuery() {
  return useQuery({
    queryKey: queryKeys.contactRequests.list(),
    queryFn: getContactRequests,
  });
}

export function useDeleteContactRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => deleteContactRequest(requestId),
    onSuccess: (_data, requestId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.contactRequests.detail(requestId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.contactRequests.all,
      });
    },
  });
}

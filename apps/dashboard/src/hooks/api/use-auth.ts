"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getMe, loginWithEmail, logout } from "@/lib/api/auth";
import { queryKeys } from "@/lib/api/query-keys";

export function useMeQuery() {
  return useQuery({
    queryKey: queryKeys.authMe,
    queryFn: getMe,
    retry: false,
  });
}

export function useSignInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginWithEmail,
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.authMe, data.user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.authMe });
    },
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.removeQueries();
    },
  });
}

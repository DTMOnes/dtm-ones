"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  changeUserPassword,
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  setUserRole,
  updateUserGeneral,
} from "@/lib/api/users";
import { queryKeys } from "@/lib/api/query-keys";
import type { ApiUserDetail } from "@/lib/api/types";

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: getUsers,
  });
}

export function useUserQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => getUserById(userId),
    enabled: Boolean(userId),
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUserGeneralMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserGeneral,
    onSuccess: (updated) => {
      queryClient.setQueryData<ApiUserDetail | undefined>(
        queryKeys.users.detail(updated.id),
        (current) => (current ? { ...current, ...updated } : current),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useChangeUserPasswordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeUserPassword,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
    },
  });
}

export function useSetUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setUserRole,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_data, userId) => {
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

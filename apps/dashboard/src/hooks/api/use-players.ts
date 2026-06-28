"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPlayer,
  deletePlayer,
  getPlayerById,
  getPlayers,
  updatePlayer,
} from "@/lib/api/players";
import { queryKeys } from "@/lib/api/query-keys";
import type { CreatePlayerInput, UpdatePlayerInput } from "@/lib/validation/players";

export function usePlayersQuery(filters: { q: string; c: string[] }) {
  return useQuery({
    queryKey: queryKeys.players.list(filters),
    queryFn: () => getPlayers(filters),
  });
}

export function usePlayerQuery(playerId: string) {
  return useQuery({
    queryKey: queryKeys.players.detail(playerId),
    queryFn: () => getPlayerById(playerId),
    enabled: Boolean(playerId),
  });
}

export function useCreatePlayerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlayerInput) => createPlayer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all });
    },
  });
}

export function useUpdatePlayerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePlayerInput) => updatePlayer(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.players.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all });
    },
  });
}

export function useDeletePlayerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (playerId: string) => deletePlayer(playerId),
    onSuccess: (_data, playerId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.players.detail(playerId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

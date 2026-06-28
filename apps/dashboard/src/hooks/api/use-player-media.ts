"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deletePlayerMedia,
  uploadPlayerImage,
  uploadPlayerVideo,
} from "@/lib/api/player-media";
import { queryKeys } from "@/lib/api/query-keys";

export function useUploadPlayerImageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadPlayerImage,
    onSuccess: (media) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.players.detail(media.player_id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all });
    },
  });
}

export function useUploadPlayerVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadPlayerVideo,
    onSuccess: (media) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.players.detail(media.player_id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all });
    },
  });
}

export function useDeletePlayerMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId }: { mediaId: string; playerId: string }) =>
      deletePlayerMedia(mediaId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.players.detail(variables.playerId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all });
    },
  });
}

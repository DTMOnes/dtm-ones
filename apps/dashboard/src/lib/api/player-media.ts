import { apiFetch } from "@/lib/api/client";
import type { ApiMessageResponse, ApiPlayerMedia } from "@/lib/api/types";

export async function uploadPlayerImage(payload: {
  playerId: string;
  file: File;
  mediaType?: "image" | "institutional_picture";
}) {
  const body = new FormData();
  body.append("file", payload.file);
  body.append("media_type", payload.mediaType ?? "image");

  return apiFetch<ApiPlayerMedia>(`/players/${payload.playerId}/media/image`, {
    method: "POST",
    body,
  });
}

export async function uploadPlayerVideo(payload: {
  playerId: string;
  url: string;
}) {
  return apiFetch<ApiPlayerMedia>(`/players/${payload.playerId}/media/video`, {
    method: "POST",
    body: { url: payload.url },
  });
}

export async function deletePlayerMedia(mediaId: string) {
  return apiFetch<ApiMessageResponse>(`/player-media/${mediaId}`, {
    method: "DELETE",
  });
}

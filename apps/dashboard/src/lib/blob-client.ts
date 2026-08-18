import { upload } from "@vercel/blob/client";

import {
  playerBlobPathname,
  type PlayerBlobSlot,
} from "@/utils/player-blob-path";

export async function uploadPlayerImage(
  playerId: string,
  slot: PlayerBlobSlot,
  file: File,
): Promise<{ url: string; pathname: string }> {
  const blob = await upload(playerBlobPathname(playerId, slot, file.name), file, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",
    clientPayload: JSON.stringify({ playerId, slot }),
    contentType: file.type,
  });

  return { url: blob.url, pathname: blob.pathname };
}

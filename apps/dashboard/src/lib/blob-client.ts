import { upload } from "@vercel/blob/client";

import {
  clientBlobPathname,
  type ClientBlobKind,
  type PlayerBlobSlot,
} from "@/utils/player-blob-path";

export async function uploadPlayerImage(
  kind: ClientBlobKind,
  clientId: string,
  slot: PlayerBlobSlot,
  file: File,
): Promise<{ url: string; pathname: string }> {
  const blob = await upload(
    clientBlobPathname(kind, clientId, slot, file.name),
    file,
    {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
      clientPayload: JSON.stringify({ clientId, kind, slot }),
      contentType: file.type,
    },
  );

  return { url: blob.url, pathname: blob.pathname };
}

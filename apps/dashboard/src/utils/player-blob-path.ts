export const PLAYER_BLOB_SLOTS = ["presentation", "gallery"] as const;

export type PlayerBlobSlot = (typeof PLAYER_BLOB_SLOTS)[number];

export const PLAYER_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const PLAYER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function isAllowedPlayerImage(file: {
  size: number;
  type: string;
}): boolean {
  return (
    file.size <= PLAYER_IMAGE_MAX_BYTES &&
    (PLAYER_IMAGE_CONTENT_TYPES as readonly string[]).includes(file.type)
  );
}

export function playerBlobPrefix(
  playerId: string,
  slot: PlayerBlobSlot,
): string {
  return `players/${playerId}/${slot}/`;
}

export function playerBlobPathname(
  playerId: string,
  slot: PlayerBlobSlot,
  fileName: string,
): string {
  const base =
    fileName.split(/[/\\]/).pop()?.replace(/[^\w.\-]+/g, "-") || "image";
  return `${playerBlobPrefix(playerId, slot)}${base}`;
}

export function isPlayerBlobPathname(
  playerId: string,
  slot: PlayerBlobSlot,
  pathname: string,
): boolean {
  const prefix = playerBlobPrefix(playerId, slot);
  if (!pathname.startsWith(prefix)) {
    return false;
  }

  const rest = pathname.slice(prefix.length);
  return rest.length > 0 && !rest.includes("..") && !rest.includes("/");
}

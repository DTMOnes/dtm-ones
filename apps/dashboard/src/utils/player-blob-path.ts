export const PLAYER_BLOB_SLOTS = ["presentation", "gallery"] as const;

export type PlayerBlobSlot = (typeof PLAYER_BLOB_SLOTS)[number];

export type ClientBlobKind = "player" | "coach";

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

export function clientBlobPrefix(
  kind: ClientBlobKind,
  clientId: string,
  slot: PlayerBlobSlot,
): string {
  return `${kind === "player" ? "players" : "coaches"}/${clientId}/${slot}/`;
}

export function clientBlobPathname(
  kind: ClientBlobKind,
  clientId: string,
  slot: PlayerBlobSlot,
  fileName: string,
): string {
  const base =
    fileName.split(/[/\\]/).pop()?.replace(/[^\w.\-]+/g, "-") || "image";
  return `${clientBlobPrefix(kind, clientId, slot)}${base}`;
}

export function playerBlobPathname(
  playerId: string,
  slot: PlayerBlobSlot,
  fileName: string,
): string {
  return clientBlobPathname("player", playerId, slot, fileName);
}

export function isClientBlobPathname(
  kind: ClientBlobKind,
  clientId: string,
  slot: PlayerBlobSlot,
  pathname: string,
): boolean {
  const prefix = clientBlobPrefix(kind, clientId, slot);
  if (!pathname.startsWith(prefix)) {
    return false;
  }

  const rest = pathname.slice(prefix.length);
  return rest.length > 0 && !rest.includes("..") && !rest.includes("/");
}

export function isPlayerBlobPathname(
  playerId: string,
  slot: PlayerBlobSlot,
  pathname: string,
): boolean {
  return isClientBlobPathname("player", playerId, slot, pathname);
}

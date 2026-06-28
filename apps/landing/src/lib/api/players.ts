// Types
import type { Player } from "@/types/player";

// API
import { apiFetch } from "@/lib/api/client";

export function getPlayers(): Promise<Player[]> {
  return apiFetch<Player[]>("/players");
}

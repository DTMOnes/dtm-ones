// Types
import type { Player } from "@/types/player";

// API
import { apiFetch } from "@/lib/api/client";

export type GetPlayersFilters = {
  q?: string;
  c?: string[];
};

export function buildPlayersQuery(filters: GetPlayersFilters = {}): string {
  const params = new URLSearchParams();

  const q = filters.q?.trim();
  if (q) {
    params.append("q", q);
  }

  for (const categoryId of filters.c ?? []) {
    params.append("c", categoryId);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getPlayers(filters?: GetPlayersFilters): Promise<Player[]> {
  const query = buildPlayersQuery(filters);
  return apiFetch<Player[]>(`/players${query}`);
}

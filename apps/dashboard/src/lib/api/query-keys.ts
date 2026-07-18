export type PlayersFilters = { q: string; c: string[] };

/** Normalize filters so identical queries always hash to the same key. */
function normalizePlayersFilters(filters: PlayersFilters) {
  return {
    q: filters.q.trim(),
    c: [...filters.c].sort(),
  };
}

export const queryKeys = {
  players: {
    all: ["players"] as const,
    list: (filters: PlayersFilters) =>
      ["players", "list", normalizePlayersFilters(filters)] as const,
    detail: (id: string) => ["players", "detail", id] as const,
  },

  categories: {
    all: ["categories"] as const,
    list: (q: string) => ["categories", "list", q.trim()] as const,
    detail: (id: string) => ["categories", "detail", id] as const,
  },

  users: {
    all: ["users"] as const,
    list: () => ["users", "list"] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
};

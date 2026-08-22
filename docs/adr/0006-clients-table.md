# One `clients` table with a kind

A Client is a Player or a Coach. The database is one `clients` table with `kind` (`player` | `coach`). Shared facts live on that row (name, nationality, last club, Eurobasket link, Visibility, presentation image) and in the gallery table (both kinds). Player-only facts (`height_cm`, `category_id`, videos) stay nullable on the row or in the videos table, with a CHECK so a Coach cannot have height, Category, or videos. Name, nationality, and last club may be unset while the Client is private. The `roster` view is public Clients.

**Considered:** `clients` plus `player_profiles` (more joins). Separate `players` and `coaches` tables (dashboard lists become a UNION; the word Client exists only in TypeScript).

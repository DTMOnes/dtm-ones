# One `clients` table with a kind

A Client is a Player or a Coach. The database is one `clients` table with `kind` (`player` | `coach`). Shared facts live on that row (name, nationality, last club, Visibility). Player-only facts (`height_cm`, `category_id`, presentation image, gallery, videos) are nullable or in Player-only tables, with a CHECK so a Coach cannot have them. The `roster` view is public Clients.

**Considered:** `clients` plus `player_profiles` (more joins). Separate `players` and `coaches` tables (dashboard lists become a UNION; the word Client exists only in TypeScript).

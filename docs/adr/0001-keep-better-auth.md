# Keep Better Auth through the InsForge exit

Dashboard Users are Owner-provisioned identities that already live in our Postgres via Better Auth (`createUser` / `setRole` / `removeUser`, mirrored into `public.users`). We will not move that identity onto InsForge Auth (no Owner-provisioning API) or onto another vendor Auth product when we leave InsForge. Identity then travels with a database dump instead of dying with the Auth vendor.

**Considered:** InsForge Auth (cannot provision Users as an Owner). Supabase Auth (can provision, but Users would no longer be just Postgres we restore elsewhere). Dropping Better Auth was a consolidation preference, not a missing feature.

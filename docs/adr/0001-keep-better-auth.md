# Keep Better Auth through the InsForge exit

Dashboard Users are Owner-provisioned identities that live in Postgres via Better Auth (`createUser` / `setRole` / `removeUser`). A User is a Better Auth user whose role is `owner` or `staff`. There is no second User table. We will not move that identity onto InsForge Auth (no Owner-provisioning API) or onto another vendor Auth product. Identity then travels with a database dump instead of dying with the Auth vendor.

**Considered:** InsForge Auth (cannot provision Users as an Owner). Supabase Auth (can provision, but Users would no longer be just Postgres we restore elsewhere). A `public.users` copy of each Better Auth user — that copy existed so PostgREST/InsForge could see Owner and Staff without reading `better_auth`. We do not use that API now.

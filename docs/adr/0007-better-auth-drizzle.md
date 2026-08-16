# Better Auth uses the Drizzle adapter

Dashboard identity stays Better Auth (ADR 0001). The dashboard talks to Postgres through one Drizzle client, including Better Auth. `drizzle-kit` is the migrator for both `public` and `better_auth`. The landing role still has no access to `better_auth` (ADR 0005).

**Considered:** Leave Better Auth on its own `pg` Pool (two clients; Better Auth’s migrator and Drizzle both own tables).

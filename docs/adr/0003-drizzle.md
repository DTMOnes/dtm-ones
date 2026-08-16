# Drizzle for domain Postgres

InsForge’s query builder goes away. Domain tables (Clients, Categories, ContactRequests) are queried with Drizzle, not Prisma, Kysely, or ad-hoc SQL. Schema, migrations, and the client live in one package both Next.js apps import. Better Auth also uses this Drizzle client (see ADR 0007).

**Considered:** Prisma (a second runtime next to Better Auth’s Pool). Kysely (no migrator). Raw `pg` everywhere (how the User directory already drifts from the rest of the app).

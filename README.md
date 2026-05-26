# DTM Ones

Turborepo monorepo with two Next.js apps:

| App | Package | Dev URL | Role |
| --- | --- | --- | --- |
| Landing | `@dtm/landing` | http://localhost:3000 | Public marketing site |
| Dashboard | `@dtm/dashboard` | http://localhost:3001 | Admin panel & auth |

## Setup

```bash
pnpm install
```

Environment variables live in `.env` at the **repository root**. Both apps load them via `loadEnvConfig` in each `next.config.ts`. Keep that file complete for dashboard builds (auth, database, Supabase).

## Scripts

```bash
pnpm dev          # Run landing + dashboard (Turborepo)
pnpm build        # Build all apps
pnpm lint         # Lint all apps

pnpm db:push      # Drizzle push (dashboard)
pnpm db:studio    # Drizzle Studio (dashboard)
pnpm db:seed      # Seed dev admin (dashboard)
```

Run a single app:

```bash
pnpm --filter @dtm/landing dev
pnpm --filter @dtm/dashboard dev
```

## Structure

```
apps/
  landing/     # Public site (/, /contact, /roster)
  dashboard/   # Admin (/dashboard, /auth, /api/auth)
packages/
  typescript-config/   # Shared TS configs
supabase/              # Migrations & local Supabase
```

## Turborepo

This repo uses [Turborepo](https://turbo.build) for task orchestration and caching. See `turbo.json` for pipeline tasks.

Optional: install the Turborepo agent skill for AI-assisted monorepo work:

```bash
npx skills add vercel/turborepo
```

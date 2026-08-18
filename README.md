# DTM Ones

Turborepo monorepo: two Next.js apps and a shared Drizzle package on Neon.

| App       | Package           | Dev URL               | Role                                          |
| --------- | ----------------- | --------------------- | --------------------------------------------- |
| Landing   | `@dtm/landing`    | http://localhost:3000 | Public Roster and ContactRequest form         |
| Dashboard | `@dtm/dashboard`  | http://localhost:3001 | Users and Staff work                          |

## Setup

```bash
pnpm install
```

Environment variables live in `.env` at the **repository root**. Copy `.env.example`. Both apps need `DATABASE_URL`. The dashboard also needs Better Auth and `BLOB_READ_WRITE_TOKEN`.

## Scripts

```bash
pnpm dev          # Run all apps (Turborepo)
pnpm build        # Build all apps
pnpm lint         # Lint all apps
pnpm test         # Run tests
pnpm db:push      # Push Drizzle schema to Neon
pnpm db:seed      # Seed a dev Owner (dashboard)
```

Run a single app:

```bash
pnpm --filter @dtm/landing dev
pnpm --filter @dtm/dashboard dev
```

## Structure

```
apps/
  landing/     # Public site (/, /contact, Roster)
  dashboard/   # Staff (/players, /coaches, /contacts, /users)
packages/
  database/            # Drizzle schema and client
  typescript-config/   # Shared TS configs
```

## Turborepo

This repo uses [Turborepo](https://turbo.build) for task orchestration and caching. See `turbo.json` for pipeline tasks.

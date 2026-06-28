# DTM Ones

Turborepo monorepo with FastAPI as the database-backed API and Next.js apps
that consume it:

| App       | Package          | Dev URL               | Role                          |
| --------- | ---------------- | --------------------- | ----------------------------- |
| Landing   | `@dtm/landing`   | http://localhost:3000 | Public marketing site         |
| Dashboard | `@dtm/dashboard` | http://localhost:3001 | Admin panel                   |
| Landing 2 | `@dtm/landing2`  | http://localhost:3002 | Alternate landing (v0 import) |
| API       | `@dtm/api`       | http://localhost:8000 | FastAPI backend               |

## Setup

```bash
pnpm install
```

Environment variables live in `.env` at the **repository root**. The API owns
database access through `DATABASE_URL=postgresql://...`; the
frontend apps use `API_URL` / `NEXT_PUBLIC_API_URL` and do not need direct
database credentials.

## Scripts

```bash
pnpm dev          # Run all apps (Turborepo)
pnpm build        # Build all apps
pnpm lint         # Lint all apps
pnpm db:seed      # Seed dev admin (API)

pnpm test:api:e2e # Run API e2e tests against a dedicated test Postgres database
```

Run a single app:

```bash
pnpm --filter @dtm/landing dev
pnpm --filter @dtm/dashboard dev
pnpm --filter @dtm/landing2 dev
```

API e2e test setup details live in `apps/api/README.md`.

## Structure

```
apps/
  api/         # FastAPI backend and database access
  landing/     # Public site (/, /contact, /roster)
  landing2/    # Alternate landing (single-page)
  dashboard/   # Admin (/dashboard, /auth)
packages/
  typescript-config/   # Shared TS configs
```

## Turborepo

This repo uses [Turborepo](https://turbo.build) for task orchestration and caching. See `turbo.json` for pipeline tasks.

Optional: install the Turborepo agent skill for AI-assisted monorepo work:

```bash
npx skills add vercel/turborepo
```

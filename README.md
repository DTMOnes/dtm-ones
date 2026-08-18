# DTM Ones

A basketball agency that represents Clients. The Roster is the public Clients. Users maintain Clients and inbound ContactRequests from a dashboard.

Two Next.js apps, one GitHub repository, one shared Drizzle package on Neon.

| App       | Package           | Dev URL               | Role                                  |
| --------- | ----------------- | --------------------- | ------------------------------------- |
| Landing   | `@dtm/landing`    | http://localhost:3000 | Public Roster and ContactRequest form |
| Dashboard | `@dtm/dashboard`  | http://localhost:3001 | Users and Staff work                  |

The landing site is unauthenticated. The dashboard is a Better Auth wall: Owner and Staff share Staff work; only an Owner manages Users.

## Setup

```bash
pnpm install
```

Copy `.env.example` to `.env` at the **repository root**. Both apps load that file.

Locally, one owner `DATABASE_URL` is enough. Production landing uses a restricted Neon role (see [Deploy](#deploy)).

## Environment variables

Names live in `.env.example`. Do not add InsForge keys.

| Variable                         | Landing | Dashboard | Notes                                                                 |
| -------------------------------- | ------- | --------- | --------------------------------------------------------------------- |
| `DATABASE_URL`                   | yes     | yes       | Local: owner connection. Production landing: `dtm_landing` role only. |
| `BETTER_AUTH_SECRET`             | no      | yes       | Production: `openssl rand -base64 32`. Do not reuse the local secret. |
| `BETTER_AUTH_URL`                | no      | yes       | Local: `http://localhost:3001`. Production: the live dashboard URL.   |
| `NEXT_PUBLIC_BETTER_AUTH_URL`    | no      | yes       | Same value as `BETTER_AUTH_URL`.                                      |
| `BLOB_READ_WRITE_TOKEN`          | no      | yes       | Staff upload Player images. The landing site never uploads.           |
| `DEV_SEED_ADMIN_EMAIL`           | no      | seed only | Not for deploy.                                                       |
| `DEV_SEED_ADMIN_PASSWORD`        | no      | seed only | Not for deploy.                                                       |
| `DEV_SEED_ADMIN_NAME`            | no      | seed only | Not for deploy.                                                       |

## Scripts

```bash
pnpm dev              # Run all apps (Turborepo)
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm test             # Run tests
pnpm db:push          # Push Drizzle schema to Neon
pnpm db:grant-landing # Grant the landing role Roster SELECT and ContactRequest INSERT
pnpm db:seed          # Seed a dev Owner (dashboard)
```

Run a single app:

```bash
pnpm --filter @dtm/landing dev
pnpm --filter @dtm/dashboard dev
```

## Structure

```
apps/
  landing/             # Public site (/, /contact, Roster)
  dashboard/           # Staff (/players, /coaches, /contacts, /users)
packages/
  database/            # Drizzle schema and client
  typescript-config/   # Shared TS configs
```

## Deploy

Two Vercel projects from this repository. Do not put both apps in one Vercel project. Runtime is Node.js, not Edge.

A human creates the projects. One git push then deploys both.

### 1. Landing Neon role

The landing project must not use the owner `DATABASE_URL`. A bug on the landing site must not dump private Clients, Users, or the inbox.

In Neon, create a login role named `dtm_landing`. With the owner `DATABASE_URL` in `.env`, run:

```bash
pnpm db:grant-landing
```

That role can `SELECT` the Roster views and `INSERT` ContactRequests. It cannot read `better_auth` or the real Client tables.

### 2. Two Vercel projects

Import this GitHub repository twice in Vercel (Framework Preset: Next.js):

| Project    | Root Directory   | Production `DATABASE_URL`                          |
| ---------- | ---------------- | -------------------------------------------------- |
| Landing    | `apps/landing`   | Connection string for Neon role `dtm_landing`      |
| Dashboard  | `apps/dashboard` | Owner connection string (the real tables)          |

Leave Vercel’s monorepo defaults. It installs from the repository root so `@dtm/database` resolves. Do not set Edge.

Connect both projects to the same repository so a push deploys both.

### 3. Environment variables in Vercel

Set these **before** the first production build. Missing Better Auth vars fail the dashboard build. `localhost` is a valid URL that will break sign-in on the live origin.

Vercel shows the dashboard origin (`https://<project>.vercel.app`) as soon as you create the project. Put that origin in both Better Auth URL vars. If you later add a custom domain, update both vars and redeploy.

Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`. Do not reuse the local secret.

**Landing**

- `DATABASE_URL` — `dtm_landing` connection string only

**Dashboard**

- `DATABASE_URL` — owner connection string
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` — dashboard production origin, not `localhost`
- `NEXT_PUBLIC_BETTER_AUTH_URL` — same value as `BETTER_AUTH_URL`
- `BLOB_READ_WRITE_TOKEN` — enable Vercel Blob on the dashboard project; Vercel injects this. Do not add it to landing.

Do not set `DEV_SEED_ADMIN_*` or `SKIP_ENV_VALIDATION` on Vercel. Do not add InsForge keys.

### 4. Check

- Landing URL shows the Roster and accepts a ContactRequest
- Dashboard URL lets a User sign in
- Landing `DATABASE_URL` is the `dtm_landing` role, not the owner
- Neither project has InsForge keys

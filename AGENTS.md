---
description: Instructions for agents working on DTM Ones
globs: *
alwaysApply: true
---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Domain

Read `CONTEXT.md` before naming a domain concept. Read the ADRs in `docs/adr/` that touch the area you are changing. See `docs/agents/domain.md`.

Use the glossary’s words: User, Owner, Staff, Client, Player, Coach, Roster, Visibility, Eurobasket link, Category, Trash, ContactRequest.

## Work

GitHub Issues on `FrancoLedArg/dtm-ones` via `gh`. See `docs/agents/issue-tracker.md`.

Triage labels (same strings): `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

## Stack

Decisions live in `docs/adr/`. Follow them for new work.

- Two Next.js apps, one `@dtm/database` package (ADR 0004). Landing is the public Roster and ContactRequest form. Dashboard is Users and Staff work.
- Neon Postgres and Vercel Blob. Leave InsForge (ADR 0002). Do not add InsForge tables, storage, Auth, or the JWT bridge.
- `@dtm/database` holds the Drizzle schema and `createDatabase(connectionString)`. Apps own the connection. drizzle-kit lives in that package (ADR 0003, 0007).
- Better Auth stays on the dashboard, Drizzle adapter. A User is a Better Auth user with role `owner` or `staff` (ADR 0001, 0007). There is no `public.users` table.
- Server Actions use next-safe-action (ADR 0011). Throw `AppError` (or let libraries throw); `handleServerError` logs and shapes. Follow `.cursor/rules/next-safe-action.mdc`.
- Staff upload Player images to Vercel Blob (ADR 0008).
- Environment variables: t3-env per consumer, package presets via `extends`. Follow `.cursor/rules/env-variables.mdc`.
- `page.tsx` exports only `Page`. Follow `.cursor/rules/nextjs-page-structure.mdc`.
- App folders: libraries in `lib`, helpers in `utils`, config in `config`. Follow `.cursor/rules/nextjs-app-folders.mdc`.
- Use existing CSS theme tokens for color.

## Skills

This repo uses [Matt Pocock’s engineering skills](https://github.com/mattpocock/skills). Reach for the named skill; do not improvise the process.

- `/tdd` — test-first, red-green-refactor, integration tests
- `/diagnosing-bugs` — diagnose or debug a failure
- `/code-review` — review since a commit, branch, or PR
- `/codebase-design` — deep modules, seams, where an interface goes
- `/domain-modeling` — change glossary terms or record an ADR
- `/grilling` — stress-test a plan or decision
- `/prototype` — throwaway prototype to answer a design question
- `/research` — gather docs or facts into a markdown file
- `/wizard` — interactive bash for steps only a human can do
- `/resolving-merge-conflicts` — in-progress merge or rebase conflicts
- `/writing-for-agents` — edit skills, `AGENTS.md`, or `CLAUDE.md`
- `/find-skills` — find or install a skill

Impeccable — landing or dashboard UI (design, redesign, critique, polish).

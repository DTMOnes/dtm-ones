# One GitHub repo, two Vercel projects

Landing and dashboard stay two Next.js apps (ADR 0004). They deploy as two Vercel projects from this Turborepo, Root Directory `apps/landing` and `apps/dashboard`, Node.js runtime (not Edge). One git push can deploy both. We will not put both apps in a single Vercel project — that is one Next.js app, which we refused.

**Considered:** One Vercel project (cannot be two Next.js origins). Edge runtime (Worse for Better Auth and `pg`/Drizzle).

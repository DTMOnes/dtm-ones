# Exit InsForge for Neon Postgres and Vercel Blob

InsForge is a public PostgREST + storage API. Better Auth is the real User session. Those two do not share a token, so staff authorization on the data API is a handmade JWT bridge — a second identity system. We will leave InsForge for Neon (Postgres only) and Vercel Blob (Player images). The Next.js apps are the only processes that talk to Postgres. There is no public data API.

**Considered:** Stay on InsForge and harden RLS (still a vendor we do not want to park on). Move to Supabase and keep PostgREST (same shape, more famous logo; Better Auth still would not be what the API authenticates). Supabase-as-Postgres with REST grants stripped (closes the door, still a BaaS account). Neon + R2/S3 (more portable files; more wiring).

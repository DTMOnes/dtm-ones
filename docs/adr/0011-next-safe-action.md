# next-safe-action in both Next.js apps

Server Actions use next-safe-action in the landing site and the dashboard. Dashboard procedures run Owner/Staff middleware. The landing ContactRequest procedure is public: it does not require a User. This replaces handmade `ActionResult` and the InsForge `{ data, error }` rule. It does not add TanStack Query on Contacts, Categories, Clients, or Users.

**Considered:** Dashboard only (one public action). Keep `ActionResult` (no new library).

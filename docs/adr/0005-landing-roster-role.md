# Landing role sees only the Roster

The landing site is unauthenticated. It may show the Roster and insert a ContactRequest. It must not read a private Client, the inbox, or Users. The landing Neon role can SELECT only a `roster` view (public Clients that are not in the Trash) and INSERT ContactRequests. The dashboard role is Better Auth: Owner and Staff. That role owns the real tables. We will not give both apps the owner connection string and trust `WHERE visibility = 'public'`.

**Considered:** Same `DATABASE_URL` in both apps (a landing bug dumps private Clients). Table GRANTs without a view (`SELECT * FROM players` still returns private rows).

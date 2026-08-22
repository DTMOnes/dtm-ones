# Product

## Platform

web

## Users

Owner and Staff of DTM Ones. A User signs in to this dashboard and is not a Client.

- **Staff** manage Clients and ContactRequests, including Trash (remove, restore, delete from Trash). They cannot manage Users.
- **Owner** can do everything Staff can, and can create Users, change a User’s name (including their own), change a User’s role, and delete Users — not their own role or themselves. The dashboard always has at least one Owner.

The agency’s public primary audience (clubs and scouts on the Roster) is not a user of this app.

## Product Purpose

Internal workspace to maintain Clients (Players and Coaches) and inbound ContactRequests so the public Roster stays accurate and complete.

Success is Staff publishing, hiding, and correcting Clients, and processing inquiries, without this origin becoming the public site.

## Positioning

Staff work for the same FIBA-licensed agency (founded June 2000 by Gustavo Gorini; license 2008019911). This origin is not the Roster. Clubs and scouts do not sign in here.

## Operating Context

- Own origin behind Better Auth (local `http://localhost:3001`; production is its own Vercel project).
- After sign-in, the default destination is the Contacts inbox (`/contacts`).
- Other Staff routes: `/clients`, `/clients/[id]`, `/categories`, `/categories/[id]`, `/trash`. Owner-only: `/users`.
- Player images upload to Vercel Blob from this app only. The landing site never uploads.
- Categories are Player positions Staff create and rename. A Category cannot be deleted while any Player has it. Coaches do not have a Category.
- Restoring a Client from Trash keeps its Visibility; public means it returns to the Roster.
- Glossary in repo `CONTEXT.md` is binding.

## Capabilities and Constraints

- A Client is a Player or a Coach. Same human doing both is two Clients. Each has Visibility and an Eurobasket link.
- Public completeness: Player needs name, Category, presentation image, height, nationality, last club, and Eurobasket link. Coach needs name, nationality, last club, and Eurobasket link. A Client may be public only when that kind’s profile is complete.
- **Confirmed intent:** complete public Coaches belong on the public Roster. The landing app does not list them yet; dashboard still maintains Coaches.
- Trash holds only Clients. ContactRequests are a separate inbox (reasons: seeking representation, looking for a player).
- Avoid: Admin (as a type of person), treating Clients as Users, draft/published, Coaches-as-Category.
- Do not add InsForge tables, storage, Auth, or a JWT bridge.
- Sibling app: `apps/landing` is the unauthenticated Roster and ContactRequest form.

## Brand Commitments

- Name: DTM Ones / DTM ONES Dashboard.
- Wordmark assets: `public/assets/dtm-ones-logo.svg`, `public/assets/dtm-ones-logo-black.svg`.
- Founder and FIBA facts are agency identity; this surface does not need to present them to Staff.

## Evidence on Hand

- Logo SVGs above (confirmed identity).
- Images under `public/assets/images/` are not confirmed as production Client media. Do not fabricate Clients, quotes, or press.

## Product Principles

1. This app exists so Staff can keep the Roster and inbox true — not so clubs can browse.
2. Visibility is public or private, gated on completeness; it is not a draft workflow.
3. Owner vs Staff is the only User distinction.
4. Trash is Clients only; inquiries stay in Contacts.
5. Use the glossary’s words; do not invent Admin, talent, or team as domain types.

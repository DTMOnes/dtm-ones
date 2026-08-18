# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: clubs and scouts browsing the public Roster to find Players or Coaches they might hire.

Also served, not primary: people seeking representation through the contact form.

This origin has no signed-in Users. Staff and Owner work is the dashboard app.

## Product Purpose

Public site for DTM Ones, a basketball agency. It shows the Roster (the public Clients) so a club or scout can evaluate represented talent, and it accepts ContactRequests.

Success is an unauthenticated visitor finding a complete public Player or Coach and sending an inquiry without seeing private Clients, Users, or Staff work.

## Positioning

FIBA-licensed agency founded in June 2000 by Gustavo Gorini, FIBA & JBA Agent (license 2008019911; FIBA Arbitration & Players' Rights). The Roster is the agency’s public Clients — not a marketplace of unaffiliated athletes.

## Operating Context

- Own origin, unauthenticated (local `http://localhost:3000`; production is its own Vercel project).
- Routes today: `/` Roster (search and Category filters), `/players/[id]`, `/about`, `/contact`.
- ContactRequest reasons: seeking representation, or looking for a player (a hiring reason; not a Player record and not about a specific Client).
- A public Client’s Eurobasket link is the external proof profile.
- Staff publish and hide Clients from the dashboard. This app never uploads media.

## Capabilities and Constraints

- Glossary is binding (`CONTEXT.md`): User, Owner, Staff, Client, Player, Coach, Roster, Visibility, Eurobasket link, Category, Trash, ContactRequest. Avoid Admin, talent, draft/published, team, lead.
- Visibility is whether a Client is on the Roster. Public only when that kind’s profile is complete. Not a document-draft workflow.
- Public Player profile: name, Category, presentation image, height, nationality, last club, Eurobasket link. Gallery and videos may be empty.
- Public Coach profile: name, nationality, last club, Eurobasket link. A Coach does not have Category, presentation image, gallery, or videos.
- A Client is exactly one of Player or Coach; the same human doing both is two Clients.
- **Intent vs current:** Coaches must appear on the public Roster. The landing Roster currently lists Players only.
- **Intent vs current:** a public Client has an Eurobasket link; the landing Player page does not currently expose it.
- Production landing uses a restricted database role: Roster view `SELECT` and ContactRequest `INSERT` only. It must not read private Clients, Users, or the inbox.
- Sibling app: `apps/dashboard` maintains Clients and ContactRequests.

## Brand Commitments

- Name: DTM Ones / DTM ONES.
- Wordmark assets: `public/assets/dtm-ones-logo.svg`, `public/assets/dtm-ones-logo-black.svg`.
- Founder and FIBA license facts above are binding.
- Taglines such as “the name talent trusts” and “25 years of uninterrupted work” were not confirmed as locked claims. Do not invent new history, awards, or testimonials.

## Evidence on Hand

- About copy with founder and FIBA facts (confirmed).
- Logo SVGs above (confirmed identity).
- Photography under `public/assets/images/` is not confirmed as live Client assets. Do not fabricate people, quotes, press, or case studies.
- Instagram `@dtm_ones` and the YouTube URL in the site menu are unverified. The current YouTube channel ID matches a well-known placeholder.

## Product Principles

1. The Roster is what clubs and scouts came for: findable, complete, public Clients only.
2. Players and Coaches are both Clients on the Roster; Coaches are not a Staff-only record.
3. Agency identity is the wordmark plus founder and FIBA facts — not invented proof.
4. The public origin never exposes Staff work, private Clients, or Users.
5. ContactRequests are classified by why they were sent, not by who sent them.

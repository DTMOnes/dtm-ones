# Dashboard design brief

**Reading this as:** internal Staff and Owner admin (redesign-preserve) for a FIBA agency workspace, with a quiet shadcn Nova language, leaning toward radix-nova tokens, Geist, and card craft. Not a marketing site.

This origin is a dense product UI. Do not apply landing-page patterns (heroes, bento, marquees, kinetic type, photography, Big Shoulders, brand chroma). The official system is **shadcn Nova** (`components.json` `style: radix-nova`, `baseColor: neutral`). Elevate by using it consistently, not by inventing a second look.

| Dial | Value | Why |
| --- | --- | --- |
| `DESIGN_VARIANCE` | 3 | Predictable admin. Same shell on every route. |
| `MOTION_INTENSITY` | 3 | Hover, focus, and `:active` only. No scroll-hijack, no entry choreography. |
| `VISUAL_DENSITY` | 5 | Compact 32px controls, comfortable page and card air. |

## Goal

Staff should be able to process ContactRequests and keep Clients true without fighting the UI. Success is one page rhythm and one card language across Contacts, Players, Coaches, Categories, Trash, Users, and sign-in.

Keep: routes, glossary, shadcn primitives, Geist, zinc tokens, forced `html.dark`, Phosphor in app chrome, Lucide inside generated `components/ui`.

Discard: the previous "Night Bench" brief (named zinc colors, Big Shoulders headlines, marketing identity on this origin).

## Audit (what is wrong today)

The primitives are fine. Call sites disagree.

**Cards.** Same `Card` is restyled per page: `shadow-sm` on some, none on others; `CardHeader` sometimes `border-b`, sometimes not; `CardContent` and `CardFooter` pick up extra `py-6` / `border-t` / `pb-6` that the primitive already handles. Player Visibility and Coach Visibility are the same job with different structure (badge, nested well, footer padding). Delete User and Delete Category copy a one-off destructive treatment. Inbox tiles are the closest to a finished recipe.

**Pages.** List pages mix `gap-8 p-6 md:p-10` and `gap-10 p-10`. Titles are `text-2xl font-bold`. Toolbars do not share one cluster. The list well class is pasted onto every `ItemGroup`. Detail pages mix back-button variants (`ghost` on Players, `outline` elsewhere), padding, and stacking. Player Info is a fragment plus a nested stack; Coaches, Categories, and Users are a single column of cards.

**Chrome.** Sidebar is typeset "DTM Ones", not the committed wordmark SVG. Header breadcrumbs omit Trash. Dark `--sidebar-primary` is leftover indigo, not zinc.

## Tokens (do not invent a palette)

Use the existing CSS variables in `src/app/globals.css`. Design against the `.dark` values. `:root` light tokens stay unused kit.

- Surfaces: `--background`, `--card`, `--muted`, `--sidebar`
- Text: `--foreground`, `--muted-foreground`
- Edges: `--border`, `--input`, `--ring` (`ring-1 ring-foreground/10` on cards)
- Action fill: `--primary` (near-white on dark)
- Danger only: `--destructive` (Trash, delete, invalid fields). Never decoration, never nav, never charts.

Fix `--sidebar-primary` in `.dark` so it matches zinc `--primary`, not indigo.

Radius stays Nova: `--radius: 0.625rem`. Controls `rounded-lg` (10px). Cards, dialogs, inset canvas `rounded-xl` (14px). No badges. Status is a word, not a chip. No third radius.

## Card recipes

Put shared look on `src/components/ui/card.tsx`. Call sites choose a recipe with composition, not a snowflake `className`.

**Primitive defaults (bake these in, then delete duplicates):**

- `rounded-xl bg-card ring-1 ring-foreground/10`, inset highlight, soft drop
- Header: flush band, `bg-muted/40 border-b px-5 py-4`. Title `text-lg tracking-tight`. Description `leading-relaxed max-w-prose`
- Content: `px-5 py-5` on the card surface. No extra vertical padding on the card itself
- Footer: flush action bar, `border-t bg-muted/50 px-5 py-3.5`, actions `justify-end`
- Forms that wrap content + footer use `className="contents"` so the bands stay flush
- Do not pass `shadow-sm`, `py-6`, or a second `border-t` on footer

### 1. Work card

Player Information, Name, Role, Rename, sign-in form.

- Title names the field group (`Player Information`, `Name`, `Role`)
- Description is one or two sentences of the completeness rule, glossary-true
- Player Information description: "Some general information about each player to display in their landing page profile."
- Body is the form. Labels above inputs. No placeholder-as-label. Player form: all text fields first (including Eurobasket link), Category last.
- Footer: secondary Reset (if the form has one) then primary Save

### 2. Status card

Player and Coach Visibility.

- Title `Visibility`
- Description: does this Client show on the landing page? Private means no, public means yes.
- Player title row: `Visibility` then `Public` or `Private` as `text-sm font-semibold tracking-tight`, same baseline. Not a pill, not muted, not a far CardAction word, not a body heading.
- Player body: two lists: `Still needed` (foreground, empty circle; presentation image links to Media) and `Ready` (muted, check). If nothing is missing, drop `Still needed` and use the muted sentence: "This profile is complete. It can be public."
- Coach still uses `CardAction` for Public/Private and lists only missing gaps until it matches the Player card.
- Footer: `Make public` / `Make private`. Disabled when making public and gaps remain
- No nested inner card. Gaps are a list, not a box in a box

### 3. Action card

Remove to Trash. Header + footer, no content slot.

- Title `Trash`
- Description: they leave this list and the Roster; restore keeps Visibility
- Footer: outline `Remove to Trash`

### 4. Danger card

Delete User, Delete Category.

- Same Work-card skeleton
- Extra: `ring-destructive/30` on the card, `border-destructive/20` and `bg-destructive/5` on header and footer
- Body: labeled facts (Name + Email, or Name + Id). Label is `text-xs font-medium` muted, value is `text-sm`. Not a second card
- Footer: destructive button, confirm in `AlertDialog`
- Disabled copy stays in the description (last Owner, self, Category still on a Player)

### 5. Media card

Presentation image, Gallery Pictures, YouTube videos.

- Same Work-card header. Description is what the media is for, not the file rules.
- Body is the image, grid, or list. Empty uses `Empty` inside the card, not a blank hole
- Under the image area: FieldDescription + InfoIcon, same pattern as YouTube. Image cards: "Supported JPEG, PNG, or WebP. Max size 5 MB."
- Footer holds card-level actions (`Upload image` / `Replace image` / `Add images`). Item-level delete stays on the row
- Presentation image is a portrait (`aspect-[3/4]`) in the body, not a square beside the buttons

### 6. Inbox row

ContactRequest rows only. Same list-row skeleton as recipe 7. Click opens the dialog.

- Leading: envelope `ItemMedia variant="icon"`
- Title: email
- Description: received date, then a message preview
- Trailing: reason as `ListRowMeta`, then `ListRowChevron`
- New: full opacity
- Read / archived: `opacity-60`. Hover `opacity-80`
- Keyboard: `role="button"`, Enter and Space open the dialog

### 7. List row

Every list page (Players, Coaches, Categories, Users, Trash, Contacts). `Item variant="muted"` inside the well. Shared bits: `ListRowAvatar`, `ListRowMeta`, `ListRowChevron`, `ListRowSkeleton` from `page-frame.tsx`.

- Leading `ItemMedia`: none on Players. Initials for Coaches, Users, and Trash. Phosphor icon for Categories and Contacts.
- Title: the name (email on Contacts). `text-sm font-medium tracking-tight`
- Description: supporting facts only, 13px muted. One ` · ` max. Height and nationality for Players. Nationality and last club for Coaches. Player count for Categories. Email for Users. Kind and nationality for Trash. Not Visibility, Category, Role, or Reason.
- Trailing `ListRowMeta`: the classifier (Category, Role, Reason). Visibility is a second muted word on Player, Coach, and Trash rows. `ListRowChevron` on rows that open a detail or dialog. Trash keeps Restore / Delete instead of a chevron.
- Hover: `bg-muted`. No badges. No card grid.

## Page shell

One `PageShell` on every dashboard route (and matching `loading.tsx` / `error.tsx`): a `div` with `flex h-full min-h-0 w-full flex-1 flex-col gap-8 p-6 md:p-10` (the inset sidebar already provides the `main` landmark).

```
h1:   text-2xl font-semibold tracking-tight
lede: text-sm text-muted-foreground, one line, required on list pages
```

Use `PageHeader`, `PageToolbar`, `DetailLayout`, `ListEmpty`, `ListRowAvatar`, `ListRowMeta`, `ListRowChevron`, and `ListRowSkeleton` from `src/components/page/page-frame.tsx`. Do not restyle these per route.

**List pages** (Contacts, Players, Coaches, Categories, Trash, Users)

1. Title block: glossary word + one-line lede. Primary create (if any) sits on the right of this block (`New player`, `New coach`, `New category`, `New user`), filled `Button` default variant. Not in the search row.
2. Toolbar: search and filters only, one row, `gap-2`. Omit the row when there is nothing to filter (Trash, Users). Contacts filters use the same compact `TabsList variant="line"` as Player Info/Media.
3. Working surface: one `ItemGroup` well for every list, including Contacts. Rows follow recipe 7. Empty is `ListEmpty` (Empty inside the well, `min-h-56`). No card grid on list pages.

**Detail pages** (Player, Coach, Category, User)

1. Back sits first. Player detail: ghost `size="icon-sm"` icon-only (`aria-label` Go back), then the name on the same row. Other detail pages still use ghost `size="sm"` icon+label on the row above the title.
2. Title: entity name. Player pages do not put Public/Private in the header; that word lives on the Visibility card. Coach pages still show the status word beside the name (`text-sm font-medium` muted). Lede is kind (`Player profile`), not a second headline.
3. Body uses `DetailLayout` (`grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]`):
   - Player Info: Work card in main. Status + Action cards stacked in the rail. Media tab is a column of Media cards, `gap-6`.
   - Coach: same grid (Profile | Visibility + Trash).
   - Category: Rename and Players in main, Danger in the rail. Players inside the card are muted Items, not a nested ItemGroup well.
   - User: Name and Role in main, Danger in the rail.
   - Below `lg`, single column in that same order.

**Sign-in** stays a centered `max-w-sm` Work card. Wordmark uses `public/assets/dtm-ones-logo.svg` plus "DTM ONES" in Geist. Do not import landing display type.

## Chrome

- Sidebar header: the SVG mark (`public/assets/dtm-ones-logo.svg`) + "DTM ONES". Alt "DTM ONES". Do not redraw or recolor the SVG.
- Breadcrumbs: include Trash. List routes show the section name. Detail routes show `Players / Profile` (parent is a link).
- Icons: Phosphor in sidebar, page empty states, and list-row leading marks. Leave Lucide in generated `ui`.
- Motion: button `active:translate-y-px` (already on `Button`). No page load animations. Honor `prefers-reduced-motion` if any CSS animation is added later.

## Copy

Glossary is binding: User, Owner, Staff, Client, Player, Coach, Roster, Visibility, Eurobasket link, Category, Trash, ContactRequest. Do not say Admin, talent, draft, published, lead, ticket.

One label per intent. Primary creates: `New player`, `New coach`, `New category`, `New user`. Visibility: `Make public` / `Make private`. Trash: `Remove to Trash`.

## Out of scope

- New routes, new domain concepts, light-mode identity, brand accent, landing photography, glass, gradients, neon, custom cursors.
- Restyling Nova buttons, inputs, or dialogs beyond token fixes (sidebar indigo).
- New dependencies.

## Implementation order

1. **Primitive.** Card `shadow-sm` + header `border-b`. Strip duplicate utilities from every card call site. Align Player and Coach Visibility to recipe 2.
2. **Danger + action.** Unify Delete User / Delete Category. Keep Remove to Trash as recipe 3 (outline, not destructive fill).
3. **Page shell.** Shared `main` classes, title weight, toolbar cluster, one list-well class. Same back control on detail pages. Player/Coach/Category/User grids.
4. **Chrome.** Wordmark SVG, Trash breadcrumb, zinc `--sidebar-primary`.
5. **Inbox.** ContactRequests use the same Item list as other lists (recipe 6). Reason is muted text. Keep the dialog.

Do not rewrite copy, forms, or data fetching unless a layout move requires it.

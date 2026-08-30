# Landing design brief

**Reading this as:** redesign-preserve of DTM Ones public Roster landing for Staff and visitors, dark sports/agency language, leaning toward the Player **Info glass pill + plate** as the shared chrome dialect (not a second marketing aesthetic, not dashboard Nova).

| Dial | Value | Why |
| --- | --- | --- |
| `DESIGN_VARIANCE` | 6 | Editorial photography + one chrome family. Cards stay media-led. |
| `MOTION_INTENSITY` | 5 | Short opacity / tap scale / line morph. Ease `[0.16, 1, 0.3, 1]`. No scroll hijack on chrome. |
| `VISUAL_DENSITY` | 3 | Airy roster grid; controls stay 40px pills/icons. |

## Goal

One interactive chrome language across landing **buttons and the home search field**. Staff liked the player-page Info control; that is the reference. Roster **player cards stay media hit-targets** (no glass pills on cards).

Success: header search field + filter/search openers, hamburger, player Info, Gallery/Highlights mode switch, gallery chevrons, and highlights pager share the same glass fill, border, blur, and radius rules.

## Canonical chrome (locked)

**Reference:** `Player/Info` trigger + window. Shared CSS must stay **literal** to that trigger (same fill stack, border, blur, inset highlight, drop, hover, `:active` scale `0.98`). Do not “improve” it with background transitions or open-state border boosts.

### Atoms

| Atom | Spec | Code |
| --- | --- | --- |
| **Glass pill** (labeled) | Height 40px, full pill radius, icon + uppercase Inter label | `.glass-control.glass-control--pill` / `<GlassControl variant="pill">` |
| **Glass icon** | 40×40 circle, icon only | `.glass-control.glass-control--icon` / `<GlassControl>` |
| **Glass field** | Same shell as pill; used for the home search input | `.search-pill` |
| **Glass plate** | 16px radius frosted panel (menus/windows opened by those buttons) | `.glass-plate` |
| **Backdrop** | `rgb(0 0 0 / 0.62)` dim behind modal plates | `--glass-backdrop` |
| **Glass track** | Darker segmented shell (ModeSwitch only) | ModeSwitch `.nav` — same border family, denser fill |

Tokens live in `src/app/globals.css` (`--glass-*`). Prefer tokens or `GlassControl` over one-off `#1d1d1d` circles.

### Shape lock

- Controls + search field: **full pill** (`border-radius: 999px`), height **40px**.
- Plates/dialogs: **16px** (`--glass-plate-radius`).
- Do not mix solid `#1d1d1d` + aureola search with glass icon buttons.

### Motion / fidelity lock

- Tap: scale **0.98** (match Info; honor `prefers-reduced-motion`).
- **No** `transition` on layered `background` (reads muddy on glass).
- **No** stronger border on `aria-expanded` — only `data-active` (URL filter badge).
- Overlay enter/exit: opacity (+ optional `y: -6`), ~0.28–0.3s, ease `[0.16, 1, 0.3, 1]`.
- `prefers-reduced-transparency`: solid `--glass-fill-solid`, no blur.

## Where it applies

| Surface | Variant | Notes |
| --- | --- | --- |
| Player **Info** | Pill + plate | Reference implementation |
| Home **search field** | Glass field (`.search-pill`) | Same shell as Info; aureola retired |
| Player **Gallery / Highlights** mode switch | Glass track | Darker shell; GSAP wipe stays |
| Gallery **prev/next** (`MorphSlider`) | Icon | |
| Highlights **prev/next** | Icon | |
| Header **mobile search** opener | Icon | Active URL badge = white dot |
| Header **desktop filter** opener | Icon | Active when `c` / `kind` set |
| Header **hamburger** | Icon | Line morph kept inside glass circle |
| Search/filter **overlay panel** | Plate | Companion window, not a card |

## Where it does **not** apply

| Surface | Why |
| --- | --- |
| Roster **player cards** | Photo navigation, not chrome buttons |
| Filter **chips** | Choice controls inside the plate (#54) |
| Highlights **Play** (large white circle) | Primary media CTA; keep solid high-contrast |
| Contact submit, Load more, Clear filters, footer social | Page CTAs / quiet links; out of this pass |
| Full-screen **site menu** panel | Button is glass; full-bleed black nav stays until #49 says otherwise |

## Patterns to retire

- Solid `#1d1d1d` header circles and search pill.
- Soft white **aureola** glow on search (clashed with glass).
- **Shiny placeholder** animation inside search (noisy in the mobile overlay).
- Bare hamburger with no fill (lines only).
- Background transitions on glass fills.
- Stronger border on open/`aria-expanded` (Info never did this).
- Inventing a new button dialect per feature.

## Related tickets

- Structure of home search/filter cluster: #48
- Search cluster visual: #52 (desktop glass siblings locked; shiny removed)
- Unify interactive controls: #53 (this brief)
- Filter overlay / chips fit: #54
- Header nav: #49
- Parent map: #46

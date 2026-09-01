# Landing design brief

**Reading this as:** redesign-preserve of DTM Ones public Roster landing for Staff and visitors, dark sports/agency language, leaning toward the Player **Info glass pill + plate** as the shared chrome fill dialect (not a second marketing aesthetic, not dashboard Nova).

| Dial | Value | Why |
| --- | --- | --- |
| `DESIGN_VARIANCE` | 6 | Editorial photography + one chrome family. Cards stay media-led. |
| `MOTION_INTENSITY` | 5 | Short opacity / tap scale / line morph. Ease `[0.16, 1, 0.3, 1]`. No scroll hijack on chrome. |
| `VISUAL_DENSITY` | 3 | Airy roster grid; media controls 40px; header chrome 44px. |

## Goal

One interactive chrome **fill** language across landing buttons and the home search field (darker glass light, shared tokens). Shape is **role-based** (see Shape lock). Staff liked the player-page Info control fill; that is the glass reference. Roster **player cards stay media hit-targets** (no glass pills on cards).

Success: header search field + filter/search openers, hamburger, player Info, Gallery/Highlights mode switch, gallery chevrons, and highlights pager share the same glass fill, border, blur rules. Header cluster uses soft-square shape; media overlays stay pill/circle.

## Canonical chrome (locked)

**Reference fill:** `Player/Info` trigger + window. Shared CSS must stay **literal** to that fill stack (same fill, border, blur, inset highlight, drop, hover, `:active` scale `0.98`). Do not “improve” it with background transitions or open-state border boosts. **Darker light:** cut white specular / border / inset; do **not** raise fill opacity to fake darker.

### Atoms

| Atom | Spec | Code |
| --- | --- | --- |
| **Glass pill** (labeled) | Height 40px, full pill radius, icon + uppercase Inter label | `.glass-control.glass-control--pill` / `<GlassControl variant="pill">` |
| **Glass icon** (media) | 40×40 circle, icon only | `.glass-control.glass-control--icon` / `<GlassControl>` |
| **Glass soft** (header) | 44×44, radius 12px, icon only | `.glass-control.glass-control--soft` / `<GlassControl variant="soft">` |
| **Glass field** | Same shell as soft; home search input | `.search-pill` |
| **Glass plate** | 16px radius frosted panel (menus/windows opened by those buttons) | `.glass-plate` |
| **Backdrop** | `rgb(0 0 0 / 0.62)` dim behind modal plates | `--glass-backdrop` |
| **Glass track** | Same glass shell as controls; pill height 40; sliding active segment (no white wipe) | ModeSwitch `.nav` / `.indicator` |
| **Meta** | Inter 13 / 400 / tracking −0.02em / uppercase (Player card Category reference) | Header inline nav, card Category, glass labels, Info meta, filter section labels; `--meta-*` |

Tokens live in `src/app/globals.css` (`--glass-*`, `--meta-*`). Prefer tokens or `GlassControl` over one-off `#1d1d1d` circles.

### Shape lock (role-based)

| Role | Radius | Size |
| --- | --- | --- |
| Header chrome (hamburger, search/filter openers, search field) | **12px** (`--glass-soft-radius`) | **44px** tall |
| Floating media chrome (Info pill, ModeSwitch, Play, gallery/highlights chevrons) | **999px** | 40px controls (Play is larger by design) |
| Plates / MorphSlider caption | **16px** | — |
| Page CTAs (Load more, Contact submit, empty Clear) | **12px** | — |

Do not mix solid `#1d1d1d` + aureola search with glass controls.

### Motion / fidelity lock

- Tap: scale **0.98** (match Info; honor `prefers-reduced-motion`).
- **No** `transition` on layered `background` (reads muddy on glass).
- **No** stronger border on `aria-expanded` — only `data-active` (URL filter badge).
- Overlay enter/exit: opacity (+ optional `y: -6`), ~0.28–0.3s, ease `[0.16, 1, 0.3, 1]`.
- `prefers-reduced-transparency`: solid `--glass-fill-solid`, no blur.

## Where it applies

| Surface | Variant | Notes |
| --- | --- | --- |
| Player **Info** | Pill + plate | Fill reference; keep full pill |
| Home **search field** | Glass field (`.search-pill`) | Soft radius 12; height 44; aureola retired |
| Player **Gallery / Highlights** mode switch | Glass track | Same fill as controls; measured sliding thumb; no React Bits wipe |
| Gallery **prev/next** (`MorphSlider`) | Icon (circle) | |
| Highlights **prev/next** | Icon (circle) | |
| Header **mobile search** opener | Soft | Active URL badge = white dot |
| Header **desktop filter** opener | Soft | Active when `c` / `kind` set |
| Header **hamburger** | Soft | Below `nav` (1250) only; line morph (#49) |
| Header **brand mark** | Ball below `nav`; wordmark at `nav`+ | Ball = `dtm-ones-logo.svg` (compact); wordmark = `logo-dtm-ones.png`. Same `nav` breakpoint as logo height swap / inline nav (#63) |
| Header **socials** | Meta icons | Beside brand mark, short rule separator, no glass shell. Always visible. URLs in `config/socials.ts`. Not in menu/footer (#63) |
| Header **inline nav** | Glass nav plate | Control fill + soft radius 12; Meta links inside; opacity current/hover (#63) |
| Full-screen **site menu** | Panel | Below `nav`; glass-backed full-bleed; opacity links, no SplitLink (#49) |
| Search/filter **overlay panel** | Plate | Companion window; section labels = Meta |
| Roster card **Category** | Meta | Reference for Meta |

## Where it does **not** apply

| Surface | Why |
| --- | --- |
| Roster **player cards** (chrome) | Photo navigation, not chrome buttons |
| Filter **chips** | Choice controls inside the plate (#54); keep pill |
| Highlights **Play** (large white circle) | Primary media CTA; keep solid high-contrast circle |
| Contact submit, Load more, Clear filters | Page CTAs — radius 12 for solid CTAs; not glass fill |
| Full-screen **site menu** links | Same opacity language as inline; Big Shoulders display (#49) |

## Patterns to retire

- Solid `#1d1d1d` header circles and search pill.
- Soft white **aureola** glow on search (clashed with glass).
- **Shiny placeholder** animation inside search (noisy in the mobile overlay).
- Bare hamburger with no fill (lines only).
- Background transitions on glass fills.
- Stronger border on open/`aria-expanded` (Info never did this).
- Inventing a new button dialect per feature.
- Twin **circle** header icons on mobile (use soft-square instead).
- Inter meta with **wide** tracking (0.08–0.14em) on Category / nav-like labels — Category (−0.02em) is the reference.
- Bright glass (high white specular) as the default fill.
- ModeSwitch React Bits **white circular wipe** / black-on-white invert (too loud vs glass chrome).

## Related tickets

- Structure of home search/filter cluster: #48
- Search cluster visual: #52 (desktop glass siblings locked; shiny removed)
- Unify interactive controls: #53 (this brief)
- Filter overlay / chips fit: #54
- Header nav: #49 (inline at `lg+`; hamburger + restyled overlay below; drop SplitLink)
- Header glass nav + socials face-up: #63 (ball mark below `nav`; socials beside brand; glass nav plate at `nav`+)
- Parent map: #46

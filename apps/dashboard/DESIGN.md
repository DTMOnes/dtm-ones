---
name: DTM ONES Dashboard
description: Dark zinc workbench for Owner and Staff — comfortable, compact, shadcn Nova kept close.
colors:
  bench-black: "oklch(0.145 0 0)"
  chalk: "oklch(0.985 0 0)"
  work-light: "oklch(0.922 0 0)"
  desk-surface: "oklch(0.205 0 0)"
  drawer-gray: "oklch(0.269 0 0)"
  pencil-gray: "oklch(0.708 0 0)"
  hairline: "oklch(1 0 0 / 10%)"
  input-stroke: "oklch(1 0 0 / 15%)"
  focus-zinc: "oklch(0.556 0 0)"
  hazard-red: "oklch(0.704 0.191 22.216)"
typography:
  display:
    fontFamily: "Big Shoulders, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Big Shoulders, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.375
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  pill: "26px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  page: "40px"
components:
  button-primary:
    backgroundColor: "{colors.work-light}"
    textColor: "{colors.desk-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "oklch(0.922 0 0 / 80%)"
    textColor: "{colors.desk-surface}"
    rounded: "{rounded.lg}"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.bench-black}"
    textColor: "{colors.chalk}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-destructive:
    backgroundColor: "oklch(0.704 0.191 22.216 / 20%)"
    textColor: "{colors.hazard-red}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  input:
    backgroundColor: "oklch(1 0 0 / 15%)"
    textColor: "{colors.chalk}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
  card:
    backgroundColor: "{colors.desk-surface}"
    textColor: "{colors.chalk}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "16px"
  badge:
    backgroundColor: "{colors.work-light}"
    textColor: "{colors.desk-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    height: "20px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px"
    height: "32px"
  nav-item-active:
    backgroundColor: "{colors.drawer-gray}"
    textColor: "{colors.chalk}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px"
    height: "32px"
  list-item:
    backgroundColor: "oklch(0.269 0 0 / 50%)"
    textColor: "{colors.chalk}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
---

# Design System: DTM ONES Dashboard

## Overview

**Creative North Star: "The Night Bench"**

This is Staff's dark work surface after the public site has gone quiet. Owner and Staff sit here to keep the Roster true and process ContactRequests — not to be impressed. The bench is zinc, forced dark, and deliberately close to shadcn Nova (neutral, radix-nova). Personality lives in spacing, grouping, and a slightly restful density, not in a new palette or a new silhouette.

Comfortable dark means the same chroma-zero zinc, with more air than a stock admin scaffold: roomier cards, a consistent page gutter, and a quiet lift so the canvas does not sit flush on Bench Black. It is still a tool. Scanability, native-feeling controls, and even rhythm outrank expression.

Confirmed rejections: no landing chroma or hero photography on this origin, no brand accent, no light-mode as a shipped identity. The unused indigo on `--sidebar-primary` is leftover kit, not a voice. Big Shoulders and the DTM ONES mark are shared identity, not a license to import the Roster's marketing layout.

**Key Characteristics:**

- Forced-dark zinc; Big Shoulders for the big type, Geist for the bench; two radii (controls vs surfaces)
- Compact 32px controls, generous page and card air around them
- Edges from 1px rings; depth from a soft ambient lift plus overlay shadows
- Hazard red is the only chroma; it marks danger, never decoration
- shadcn Nova shapes stay; layout, spacing, and card grouping are where craft goes

## Colors

A chroma-zero zinc bench. Light-on-dark inversion: the "primary" fill is Work Light, not a brand hue.

### Primary
- **Work Light** (oklch(0.922 0 0)): Default actions, filled badges, the thing you press. Rarity is not the point — clarity is. Pair it with Desk Surface text.

### Neutral
- **Bench Black** (oklch(0.145 0 0)): App ground behind the inset canvas and the sign-in field.
- **Desk Surface** (oklch(0.205 0 0)): Cards, popovers, sidebar track, primary-button label. One step up from the ground.
- **Chalk** (oklch(0.985 0 0)): Primary text on Bench Black and Desk Surface.
- **Drawer Gray** (oklch(0.269 0 0)): Muted fills, secondary/accent/hover wells, tabs track, destructive-adjacent quiet surfaces.
- **Pencil Gray** (oklch(0.708 0 0)): Secondary copy, timestamps, placeholders, descriptions.
- **Hairline** (oklch(1 0 0 / 10%)): Default borders and card rings.
- **Input Stroke** (oklch(1 0 0 / 15%)): Field borders — slightly stronger than Hairline so inputs read as tools.
- **Focus Zinc** (oklch(0.556 0 0)): Focus ring color, mid zinc.
- **Hazard Red** (oklch(0.704 0.191 22.216)): Destructive actions, invalid fields, Trash. The only chroma.

### Named Rules
**The Zinc Voice Rule.** Chroma is reserved for Hazard Red. Do not promote `--sidebar-primary`'s leftover indigo, do not add a brand accent, and do not color-code every status. Status uses Work Light (filled) vs outline vs Pencil Gray.

**The Dark Bench Rule.** `html` ships with `.dark`. Light `:root` tokens in `globals.css` are unused kit. Design and implement against the dark values.

**The Hazard-Only Chroma Rule.** Hazard Red is for destructive actions, invalid fields, and irreversible Trash. It is never a decorative accent, never a chart color, never a nav highlight.

## Typography

**Display Font:** Big Shoulders (with ui-sans-serif, system-ui, sans-serif) — same face as the public Roster's titles. Load 900 (landing also ships 400 / 700 / 800; this origin only needs 900).
**Body Font:** Geist (with ui-sans-serif, system-ui, sans-serif)
**Label/Mono Font:** Geist. `--font-mono` is mapped but unused in product UI.

**Character:** Athletic condensed for the names of things; optical Geist for the work. Big Shoulders is black (900), uppercase, tracking slightly tight (`-0.02em`), line-height 1 — the landing title mix, at Operate sizes. It never appears on buttons, fields, or nav items.

### Hierarchy
- **Display** (black / 900, 30px / 1.875rem, uppercase, tight tracking): Sign-in supporting type next to the mark. Not the landing's 84px hero.
- **Headline** (black / 900, 24px / 1.5rem, uppercase, tight tracking): Page titles (Contacts, Players) and a Client's name. One per page.
- **Title** (Geist medium, 16px / 1rem, snug): Card titles, dialog titles, field legends.
- **Body** (Geist regular, 14px / 0.875rem): Default UI type — lists, descriptions, buttons, inputs (16px on small viewports, 14px from `md` up).
- **Label** (Geist medium, 12px / 0.75rem): Badges, sidebar group labels ("Inbox", "Clients"), timestamps.

### Named Rules
**The Two-Voice Rule.** Big Shoulders is Display and Headline only. Geist is Title, Body, Label, and every control. Do not put Big Shoulders on buttons, inputs, table cells, or nav.

**The Page-Title Rule.** One headline per page. Supporting line under a Client name is Body in Pencil Gray ("Player profile"), not a second headline.

**The Operate-Scale Rule.** Share the landing's face and its 900 / uppercase / tight-tracking settings. Do not share its display sizes (`84px`, `clamp(28px, 3.6vw, 44px)`). Dashboard headlines stay 24px; display stays 30px.

## Layout

Inset shell: collapsible off-canvas sidebar (288px / `--spacing * 72`) beside a rounded canvas. Header is 64px (`h-16`) with trigger, hairline separator, and a single breadcrumb. Page body is a column: title, then toolbar, then the working surface.

**Page gutter** is 40px (`p-10`) on the working canvas. Contacts currently tightens to 24px on small viewports (`p-6 md:p-10`); keep that as the narrow exception, not a second desktop rhythm. **Section gap** between title and content is 32px (`gap-8`); list pages that use 40px (`gap-10`) should settle to 32px so the bench has one cadence.

**Control rhythm** is 8px inside toolbars (`gap-2`). **Card internals** are 16px (`p-4` / `gap-4`); inbox tiles open to 24px between badge, request, and date. **List rows** sit in a bordered well (`rounded-lg`, Hairline, inset 16px) with 16px between Items.

Density: compact controls, comfortable structure. Do not shrink the 32px control height to make more rows; make grouping and padding do the work. At `md` the inset canvas gains 8px margin and the xl radius; below that the sidebar is off-canvas and the canvas is full-bleed.

Sidebar groups: Inbox (Contacts), Clients (Players, Coaches, Categories, Trash), Administration (Users, Owner only). Footer holds the signed-in User.

### Named Rules
**The Page Gutter Rule.** 40px page padding, 32px between the page title block and the first working surface. Local card padding stays 16px (12px on `size="sm"`).

**The Toolbar Cluster Rule.** Search, filters, and the primary create action share one row, 8px apart, wrapping only when the viewport forces it. The create action stays at the end of the cluster.

## Elevation & Depth

Hybrid of ring edges and a soft lift. Surfaces are not flush on Bench Black: the inset canvas already uses a small drop shadow; cards should share that quiet ambient lift so the bench reads as furniture, not as stacked rectangles. Overlays (dropdown, select, popover, sheet) keep the stronger `shadow-md` / `shadow-lg`. Do not add a second decorative shadow language.

### Shadow Vocabulary
- **Canvas lift** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` — Tailwind `shadow-sm`): Inset main canvas and resting cards.
- **Overlay** (`shadow-md`): Dropdown, select, popover, combobox.
- **Sheet / nested menu** (`shadow-lg`): Sheets and dropdown submenus.
- **Tab rest** (`shadow-sm` on the active tab in the default tabs list only).

Depth from tone: Desk Surface on Bench Black is the default step. Drawer Gray is the hover/active well, not a third elevation.

### Named Rules
**The Soft Lift Rule.** Rings define the edge (`ring-1 ring-foreground/10`). A quiet `shadow-sm` lifts the canvas and cards. Stronger shadows appear only on overlays.

**The Flat-Control Rule.** Buttons, inputs, and nav items do not drop a shadow. Press feedback is a 1px translate on buttons (`active:translate-y-px`) and a Drawer Gray well on nav.

## Shapes

Nova's radius scale from `--radius: 0.625rem` (10px). Geometry is rounded-rect, never sharp, never squircle-as-brand.

- **Controls** (buttons, inputs, selects, textarea, list items): 10px (`rounded-lg`). Extra-small controls clamp toward 8–10px.
- **Surfaces** (cards, dialogs, empty wells, inset canvas): 14px (`rounded-xl`).
- **Nav items and tabs**: 8px (`rounded-md`) so they sit inside the larger canvas.
- **Badges**: pill (`rounded-4xl` / 26px). Status and Category chips are the only fully rounded form.

Borders are 1px Hairline or Input Stroke. Cards use a ring, not a border, so the edge does not double up with the lift. Dialogs match cards (14px, ring, popover fill). Overlay is `bg-black/10` plus a hairline backdrop blur — a dim, not a blackout.

### Named Rules
**The Two-Radius Rule.** 10px on things you operate, 14px on things that contain. Do not invent a third brand radius. Pills are badges only.

## Components

shadcn Nova primitives, Phosphor icons in app chrome, Lucide inside generated `components/ui`. Keep both; do not restyle icons into a new mark.

### Buttons
Compact, medium weight, 14px type. Default height 32px; `sm` 28px; `lg` 36px.
- **Shape:** Gently curved 10px (`rounded-lg`)
- **Primary:** Work Light fill, Desk Surface label, 10px horizontal padding. Hover to 80% Work Light. Active drops 1px.
- **Outline:** Hairline border, Bench Black fill, Chalk label; hover Drawer Gray well.
- **Ghost:** No fill at rest; hover Drawer Gray well. Used for header icon actions and dialog close.
- **Destructive:** Hazard Red at 20% fill, Hazard Red label — quiet alarm, not a solid red brick.
- **Hover / Focus:** `transition-all`. Focus is a 3px Focus Zinc ring at 50% plus a Focus Zinc border. Invalid fields swap the ring to Hazard Red.

### Chips
- **Style:** Pill, 20px tall, 12px medium type, 8px horizontal padding. Default is Work Light on Desk Surface; secondary is Drawer Gray; outline is Hairline.
- **State:** Public uses default (filled). Quiet labels (reason, private) use secondary or outline. ContactRequest new/read is not a chip — see Cards.

### Cards / Containers
Quiet furniture on the bench. Inbox tiles, profile sections, visibility and trash modules.
- **Corner Style:** 14px
- **Background:** Desk Surface
- **Shadow Strategy:** Soft Lift (`shadow-sm`) plus `ring-1 ring-foreground/10`
- **Border:** None; the ring is the edge
- **Internal Padding:** 16px default. `size="sm"` (12px) is for dense modules, not the Contacts inbox. Header / content / footer; footer may sit on Drawer Gray at 50% with a Hairline top.
- **Interactive cards** (ContactRequest tiles): pointer, hover to muted well (`hover:bg-muted/40`), keyboard focus ring. They are buttons in spirit. Grid gap 24px. Three bands: reason chip on top (the chip is the label), request (email, phone, message) in the middle, received date in the footer. Email, Phone, Message, and Received carry a Label-size caption. Date never shares a row with the phone.
- **Unread:** New ContactRequests sit at full opacity with the Soft Lift. Read and archived recede (`opacity-60`, no shadow). Same hairline ring on both — opacity is the status cue. Status is not a badge; the reason chip stays. Inbox tiles use 10px radius (`rounded-lg`) — they are operated, not containing furniture.

**The Receded Read Rule.** Read is a quieter tile. New is the default. Do not label new/read with a chip or a special ring on the inbox card.

### Inputs / Fields
- **Style:** 32px, 10px radius, Input Stroke border, translucent white fill (`dark:bg-input/30`), 10px horizontal padding. Placeholder Pencil Gray.
- **Focus:** Focus Zinc border + 3px ring at 50%.
- **Error / Disabled:** Hazard Red ring when `aria-invalid`. Disabled at 50% opacity with a stronger input fill.
- **Textarea:** Same stroke and radius; min-height 64px.
- **Select / combobox:** Same 32px control; menu is Overlay shadow + ring on Desk Surface.

### Wordmark
The agency mark, not typeset Geist. Same lockup as the public site, quieter.
- **Mark:** `public/assets/dtm-ones-logo.svg` — white fill, 25×21 viewBox. Use it on the dark bench (sidebar header, sign-in). Companion `public/assets/dtm-ones-logo-black.svg` exists for light surfaces this origin does not ship.
- **Lockup:** mark (~30×25) + the letters **DTM ONES** in Big Shoulders 900, uppercase, 24px on sign-in and ~18–24px in the sidebar, 10px gap. Alt text: "DTM ONES".
- **Do not** redraw the paths, recolor the SVG, put it in a colored disc, or replace it with Geist "DTM Ones".

**The Mark Rule.** The white SVG at `public/assets/dtm-ones-logo.svg` is the only mark. Pair it with Big Shoulders "DTM ONES"; never substitute typeset Geist.

### Navigation
Inset sidebar, Desk Surface track, 8px-radius items at 32px.
- **Header:** the Wordmark lockup, not a typeset substitute.
- **Group labels:** Label type, 70% Chalk, 32px row.
- **Default:** Transparent, 14px, 16px Phosphor icon, 8px gap.
- **Hover / Active:** Drawer Gray well, medium weight when active. Prefix-match the route (`/players` active on `/players/[id]`).
- **Mobile:** Off-canvas. Header trigger is a ghost icon button.

### List Item
Signature of index pages (Players, Coaches, Categories, Users, Trash).
- **Well:** Hairline bordered container, 10px radius, 16px inset, 16px row gap.
- **Row:** Drawer Gray at 50%, 10px radius, 10×12px padding. Title + Pencil Gray description; optional pill on the trailing edge.
- **Empty:** Dashed 14px well, 32px muted icon tile, Label title, Body description. Never a blank page.

### Dialogs
14px, Desk Surface, ring, 16px padding (`p-5` / 20px when the task is a ContactRequest), `sm:max-w-sm` unless the task needs more. Footer on Drawer Gray like cards. Close is a ghost icon, top-right.

ContactRequest dialog follows the inbox tile: reason chip, then labeled Email, Phone, Message, and Received. Copy sits on Email and Phone. Date lives in the footer with Archive / Delete. No status chip.

## Do's and Don'ts

### Do:
- **Do** keep shadcn Nova's zinc, 10px/14px radii, and 32px control height.
- **Do** use 40px page gutters and 32px title-to-content gaps so the bench feels restful.
- **Do** lift cards and the inset canvas with `shadow-sm` and a 1px foreground ring.
- **Do** put search, filters, and create on one toolbar row.
- **Do** use Empty inside the list well when a filter or a collection has nothing.
- **Do** write page titles as the glossary word (Contacts, Players, Trash, Users) in Big Shoulders 900, uppercase.
- **Do** use `public/assets/dtm-ones-logo.svg` plus "DTM ONES" in the sidebar and on sign-in.

### Don't:
- **Don't** introduce a brand accent or light mode as a product identity.
- **Don't** use Hazard Red for anything that is not destructive or invalid.
- **Don't** restyle Nova into squircle, glass, gradient, or neumorph.
- **Don't** drop shadows on buttons or inputs.
- **Don't** mix 24px and 40px desktop page padding; 24px is the small-viewport exception only.
- **Don't** put Big Shoulders on controls, or scale it to the Roster's hero sizes.
- **Don't** replace the SVG mark with typeset "DTM Ones", or import landing chroma / hero photography.

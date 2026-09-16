# Freelance Portfolio Website — Design Spec

Date: 2026-09-16 (revised)

## Purpose

A single-page portfolio site to attract freelance clients by showcasing
frontend development work (websites and mobile apps, with room to expand
into AI agents/other work later). The site must visually "wow" visitors —
proving design/implementation range interactively rather than just listing
projects in a template.

## Concept: "Pick Your Design Language"

The site opens on a 3D scene of floating cards, each a live preview of a
distinct, complete design language. Clicking a card zooms it to fill the
viewport, and the entire site — not just the hero — reveals itself rendered
in that design language: colors, typography, layout, components, and
motion all change. A persistent control lets a visitor switch design
language at any point later in their visit. This directly demonstrates the
owner's range across visual styles, which is the core sales pitch of the
site.

This supersedes an earlier single-theme "Live Product Showcase" plan (dark
canvas, one accent color) — abandoned in favor of this multi-theme concept,
which better fits the goal of demonstrating design versatility.

### The three design languages

Working set (exact final choice may still change, but implementation should
proceed against this set unless revised):

1. **Apple-clean** — minimal, light, generous whitespace, soft rounded
   corners, restrained neutral palette with a single accent, system-style
   sans typography (e.g. SF Pro–adjacent / Inter). Calm, premium, consumer
   product feel.
2. **Retro** — a CRT/terminal-adjacent throwback: glowing phosphor-green
   and amber accents on near-black, scanline and vignette texture,
   chunky pixel-grid display type, low-fi monospace/bitmap body copy.
   Nostalgic, glowing, tactile.
3. **Terminal** — dark, monospace-led (e.g. JetBrains Mono / Fira Code
   throughout, not just labels), command-line/IDE motifs (blinking cursor,
   ASCII/box-drawing borders, syntax-highlight color accents), single-column
   or terminal-window framed layout. Technical, engineer-forward.

Each theme has its own full set of section components (Hero, Work, About,
Services, Testimonials, Contact, Nav/switcher) — not a CSS-variable-only
skin — because the three languages differ in layout and interaction, not
just palette. All three read from one shared content data source (project
list, about copy, services copy, testimonials, contact info) authored once,
so content only needs to be written a single time.

## Tech Stack

- **Framework:** Next.js (App Router) + React + TypeScript
- **Styling:** Tailwind CSS, with per-theme token/config sets
- **3D intro scene:** built visually in [Spline](https://spline.design/)
  (3 floating card objects, named per theme e.g. `Card_Apple`,
  `Card_Retro`, `Card_Terminal`, each with theme-appropriate materials
  — frosted glass, glowing CRT-green retro grid, terminal phosphor glow —
  and a mouse-hover tilt interaction authored in Spline). Embedded via
  `@splinetool/react-spline`; the scene's `onSplineMouseDown` handler
  receives a `SplineEvent` (`{ target: { name, id } }`) and reads the
  clicked object's name to trigger theme selection, then
  drives the zoom/transition and theme switch from React (not from a
  CSS-variable swap alone — see theming approach above, which this
  transition hands off into).
- **Fallback picker:** a CSS/2D version of the same card-pick concept and
  zoom transition for mobile and low-end/low-power devices (feature-detect
  WebGL support and reduced-motion preference; fall back accordingly),
  since Spline's WebGL scene has the same device constraints raw R3F would
- **Motion:** Framer Motion for section reveals, hover effects, and the
  cross-fade/transition when switching between theme component trees
- **Contact form backend:** Next.js API route + an email-sending service
  (e.g. Resend) to deliver submissions to the owner's inbox
- **Deployment:** Vercel

## Theme Switching Behavior

- Every visit (including return visits) starts at the card-pick intro —
  no persistence of a prior choice. Consistency of the wow-moment takes
  priority over skipping it for returning visitors.
- Once a theme is chosen, a small floating control (fixed position,
  unobtrusive) remains available across the whole site to reopen the
  picker and switch to a different design language at any time.
- Switching themes cross-fades/transitions from one full component tree to
  another, preserving the visitor's approximate scroll position/section
  context where practical.

## Content Model (shared across all three themes)

A single data source (e.g. structured TS/JSON) drives all themes:

- **Projects** (3–5 at launch): name, short outcome-led description, tech
  stack tags, live link, screenshots/video — supplied by the owner
- **About copy:** outcome/value-led narrative (speed, polish, reliability,
  business impact), plus a supporting skills list
- **Services:** offerings (e.g. landing pages, web apps, mobile apps) and
  engagement model (project-based/hourly) — copy to be finalized with the
  owner
- **Testimonials:** 2–3 entries, placeholder quotes/names for now,
  structured so real testimonials can be swapped in later
- **Contact destinations:** email, mailto link, Calendly (or similar)
  link, social links

Each theme's components render this same data; only presentation differs.

## Page Structure (per theme, single-page scroller)

1. **Nav / floating switcher** — theme-specific styling, but consistent
   role: anchor links (Work, About, Services, Contact) + a control to
   reopen the design-language picker.
2. **Hero** — outcome-led headline/subhead + primary/secondary CTAs,
   styled per theme (e.g. Apple: calm centered layout; Retro: massive
   broadsheet numerals; Terminal: boot-sequence/prompt-style intro).
3. **Work** — 3–5 projects, presented per theme (e.g. Apple: soft device
   frames with subtle shadow; Retro: bordered index-style rows with
   tabular numerals; Terminal: file-listing/directory-style entries),
   each linking to the live project.
4. **About** — value-led narrative + skills, styled per theme.
5. **Services** — offerings + engagement model, styled per theme.
6. **Testimonials** — placeholder quote cards, styled per theme.
7. **Contact** — form (name/email/message → API route → email) + direct
   mailto/Calendly/social links, styled per theme.
8. **Footer** — minimal, styled per theme.

## Content Requirements (owner to supply before/during implementation)

- Final decision (or confirmation) on the three design languages
- 3–5 real projects: name, description/outcome, tech stack, live link,
  screenshots or short video/gif
- Final hero headline/subhead copy (value-led)
- About section narrative copy
- Services list and engagement copy
- Contact destinations: email, Calendly/booking link (if any), social
  links
- Email-sending service credentials for the contact form (e.g. Resend API
  key) — added as an environment variable, never committed
- The authored Spline scene itself (a free Spline account is required):
  3 card objects named to match the themes, materials per theme (frosted
  glass / glowing CRT-green retro / terminal phosphor glow), and a hover-tilt
  interaction — either the owner builds this in Spline's editor, or it's
  scoped as a separate task since it's visual-design work done inside a
  third-party tool rather than code

## Testing / Verification Plan

- Verify the 3D picker (hover, click, zoom transition) on a WebGL-capable
  desktop browser, and verify the CSS/2D fallback triggers correctly on
  mobile and when WebGL/`prefers-reduced-motion` conditions call for it
- Verify all 7 sections render correctly under all three themes, with both
  real and placeholder content (Work and Testimonials must support
  placeholder states)
- Responsive check per theme: mobile, tablet, desktop breakpoints,
  including 3D/2D picker scaling
- Verify the floating switcher correctly re-opens the picker and that
  switching themes mid-scroll transitions cleanly without breaking layout
  or losing scroll context
- Contact form: verify successful submission delivers an email per theme,
  and that validation/error states are handled
- Manual browser check of the golden path (land on picker → pick each of
  the 3 themes in turn → scroll through all sections → switch theme
  mid-page → submit contact form) before considering the build done

## Out of Scope (for this iteration)

- Persisting a visitor's theme choice across visits
- Light/dark toggle within a theme (each theme has one fixed mode)
- Dedicated case-study sub-pages per project
- AI agents / non-frontend work categories (planned as a later expansion)
- Resume/CV download

## Risks / Notes

- This concept roughly triples section-building work versus a single-theme
  site (3 themes × ~7 sections), plus the 3D scene and transition system —
  scope and timeline should account for this.
- The 3D scene and zoom transition must be genuinely smooth to land as
  impressive rather than gimmicky; performance budgets and the fallback
  path are not optional polish, they're required for the concept to work
  across the range of visitor devices.
- Spline scenes add runtime weight (`@splinetool/runtime`) and depend on a
  scene hosted at a Spline-provided URL; the scene should be exported/self
  -hosted rather than relying on Spline's free-tier hosting limits if the
  site gets meaningful traffic. Spline's exposed interaction API (reading
  clicked-object names from the `SplineEvent` passed to
  `onSplineMouseDown` — note this is NOT the DOM `onMouseDown` prop, whose
  event target is an HTML element with no object name) is the
  integration point with React — the site's click/theme-switch logic and
  the full-screen theme swap remain hand-coded in React, only the 3D scene
  itself is authored visually.

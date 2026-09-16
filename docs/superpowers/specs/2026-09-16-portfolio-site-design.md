# Freelance Portfolio Website — Design Spec

Date: 2026-09-16

## Purpose

A single-page portfolio site to attract freelance clients by showcasing
frontend development work (websites and mobile apps, with room to expand
into AI agents/other work later). The site must visually "wow" visitors —
looking like the polished, modern products the visitor would be hiring the
owner to build — not just list projects in a generic template.

## Direction: "Live Product Showcase"

Rejected two earlier draft design systems (an acid-lime/brutalist system and
a soft frosted-glass "Luminous Obsidian" system) in favor of a new direction
built specifically for this use case: project work is displayed as if it
were actually running (browser-chrome frames for websites, phone frames for
mobile apps), on a dark, confident, restrained canvas with a single accent
color and purposeful motion — evoking the Vercel/Linear/Framer class of
product polish, since that reads as "premium software" to prospective
clients.

## Tech Stack

- **Framework:** Next.js (App Router) + React + TypeScript
- **Styling:** Tailwind CSS
- **Motion:** Framer Motion — scroll-triggered reveals, hover
  tilt/magnetic effects on project cards, smooth anchor-scroll navigation
- **Contact form backend:** Next.js API route + an email-sending service
  (e.g. Resend) to deliver submissions to the owner's inbox
- **Deployment:** Vercel
- **Theme:** dark-only (no light/dark toggle)

## Visual System

### Colors
- Canvas/background: near-black, e.g. `#0A0A0C`
- Primary text: off-white, e.g. `#F2F2F0`
- Secondary text / borders: muted gray, e.g. `#8A8A90` / low-opacity white
- Accent: electric blue, e.g. `#3B82F6` — used sparingly for links, active
  states, key CTAs, focus/glow rings, and a subtle gradient-mesh backdrop
  behind the hero. Never used as a large background fill.

### Typography
- Display/heading font: a geometric sans (e.g. Inter Tight, General Sans,
  or Space Grotesk) — confident, modern, not brutalist-scale
- Monospace accent font: JetBrains Mono — used for labels/metadata only
  (e.g. `PROJECT 01`, tech-stack tags, timestamps), giving a technical edge
  without going full brutalist

### Shape & Depth
- Soft-but-restrained corner radius (~0.5–1rem) — not zero-radius brutalist,
  not full-pill rounded
- Glassy surfaces: low-opacity blurred cards for panels/overlays
- Soft ambient glows (radial, low-opacity accent color) behind key elements
  (hero, featured project) rather than hard shadows or hard color inversion

### Motion
- Scroll-reveal fade/slide-in for sections and cards
- Tilt/magnetic hover effect on project cards
- Smooth scroll for anchor nav links
- Optional subtle cursor-follow glow, gated behind a performance budget
  (disable on reduced-motion preference and on low-end/mobile devices)

## Page Structure (single-page scroller)

1. **Nav** — fixed/sticky; logo or name; anchor links to Work, About,
   Services, Contact; background blur/opacity increases on scroll.
2. **Hero** — outcome/value-led headline (e.g. "I build fast, polished web
   & mobile products"); short subhead; primary CTA ("View Work") and
   secondary CTA ("Get in touch"); ambient gradient-mesh/glow backdrop.
3. **Work** — 3–5 featured projects (real assets, to be supplied by the
   owner). Each project renders inside a device frame: browser-chrome frame
   for web projects, phone frame for mobile projects. Includes a short
   outcome-led tagline, tech-stack tags (mono labels), and a link to the
   live site/store listing. Tilt-on-hover interaction.
4. **About** — outcome/value-led narrative (speed, polish, reliability,
   business impact) as the lead; technical skills shown as a supporting
   tag/grid below the narrative, not as the headline framing. No resume/CV
   download.
5. **Services** — what's offered (e.g. landing pages, web apps, mobile
   apps) and how engagement works (project-based/hourly) — copy to be
   finalized with the owner.
6. **Testimonials** — 2–3 quote cards using placeholder client
   quotes/names, structured so real testimonials can be swapped in later
   without layout changes.
7. **Contact** — a form (name, email, message) posting to a Next.js API
   route that emails the owner, alongside direct alternatives: mailto
   link, Calendly (or similar) link, and social links.
8. **Footer** — minimal: social links, copyright, back-to-top control.

## Content Requirements (owner to supply before/during implementation)

- 3–5 real projects: name, short description/outcome, tech stack, live
  link, and screenshots or short video/gif for each (web and/or mobile)
- Final hero headline/subhead copy (value-led)
- About section narrative copy
- Services list and engagement copy
- Contact destinations: email address, Calendly/booking link (if any),
  social links
- Email-sending service credentials for the contact form (e.g. Resend API
  key) — to be added as an environment variable, never committed

## Testing / Verification Plan

- Component-level: verify each section renders correctly with both real
  and placeholder content (particularly Work cards and Testimonials, which
  must support empty/placeholder states)
- Responsive check: mobile, tablet, desktop breakpoints for every section,
  including device-frame scaling and bottom-to-top stacking
- Motion check: verify scroll-reveal and hover effects work, and that
  `prefers-reduced-motion` disables/reduces non-essential animation
- Contact form: verify successful submission delivers an email, and that
  validation/error states are handled (required fields, invalid email)
- Manual browser check of the golden path (land on hero → scroll through
  all sections → submit contact form) before considering the build done,
  per this project's UI-verification requirement

## Out of Scope (for this iteration)

- Light/dark theme toggle
- Dedicated case-study sub-pages per project (may be a future iteration)
- AI agents / non-frontend work categories (explicitly planned as a later
  expansion, not part of this build)
- Resume/CV download

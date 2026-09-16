# Known follow-ups after the foundation + Apple theme build

Findings raised during review that were deliberately deferred rather than
fixed. None block the current branch; several get worse once the Retro
and Terminal themes are built, so the ones marked **before copying** should
be settled early in Plan 2.

## Before copying `themes/apple/*` into a second theme

- **Palette duplication / Tailwind `@theme` tokens.** The Apple palette's
  six hex values repeat as literal arbitrary values across seven files.
  A TS constants module cannot feed Tailwind (arbitrary values must be
  static literals), but Tailwind v4's `@theme` block in `app/globals.css`
  produces real, statically-extractable utility classes and would work.
  Deferred because the three themes have deliberately disjoint palettes,
  so each needs its own block regardless and the per-theme cost is the
  same whenever it happens. Decide the convention once, with two themes
  in hand.
- **Section contract is inconsistent inside the reference theme.**
  `Work` and `Services` have headings and ids; `About` has an id but no
  heading; `Testimonials` has neither. Two theme authors will copy that
  inconsistency. Settle which sections get ids and headings, then apply
  it to all three.
- **Responsive behavior was never done.** `CardPicker2D`'s three fixed
  `w-56` cards in a non-wrapping flex row shrink to ~87px slivers at
  375px, and `AppleNav`'s four links plus wordmark have no mobile
  treatment. The 2D picker is the designated mobile path, so this matters
  more than it looks. Plan 4 defers the responsive pass, but doing it
  after three themes exist triples it.
- **`h-screen` on `CardPicker2D` and `ComingSoon`** is `100vh`, which
  misbehaves with mobile browser toolbars. `min-h-dvh` is the modern form.

## Contact endpoint, before going live

- **`from: 'onboarding@resend.dev'`** is Resend's shared sandbox sender.
  It only delivers to the Resend account owner's own address. A verified
  domain is required before the form works for anyone else.
- **`process.env.CONTACT_TO_EMAIL as string`** is cast with no guard; an
  unset variable produces a bare 500.
- **The destination address is stated twice** — the `CONTACT_TO_EMAIL`
  env var and `content.contact.email` in the content model. They can
  drift.
- **No rate limit, honeypot, or message length cap** on a public
  endpoint. Acceptable for a portfolio, worth a line before launch.
- **The client discards the route's specific validation message** —
  `Contact.tsx` checks only `response.ok` and shows generic text. Low
  impact, since `required` and `type="email"` make a 400 near-unreachable
  from the real form.

## Test suite

- **`FloatingSwitcher.test.tsx` mocks the context it exists to consume,**
  so it asserts its own mock. The round-trip test now covers the real
  wiring, but this file will be copied as a template — rewrite it against
  a real provider or delete it.
- **`lib/device-support.ts`'s two hooks have no tests.**
  `ThemeRenderer.roundtrip.test.tsx` has to hand-stub `window.matchMedia`
  to work around that.
- **`app/layout.tsx` has no test.** The regression where the site
  silently shipped in Arial (because `globals.css` referenced
  `--font-geist-*` variables the layout no longer defined) is guarded by
  nothing.
- **No CI guard reproduces the Web Animations API defect** that wedged
  the theme switcher — jsdom cannot model the timing. The existing test
  guards only the logical symptom (reintroducing `AnimatePresence`
  `mode="wait"` or `exit`). Treat the comment in
  `components/ThemeRenderer.tsx` as the real guard.
- **Five jsdom `HTMLCanvasElement.getContext` warnings** appear in test
  output, from `PickerGate`'s test exercising the real
  `useWebGLSupported` hook. Accepted as the cost of real coverage over a
  mocked test.
- **Weak assertions:** `Testimonials.test.tsx` leaves its second fixture
  unasserted; `ComingSoon.test.tsx`'s two assertions both resolve to the
  same `h1`.

## Smaller

- `SplinePicker` silently no-ops when a click lands on a Spline object
  outside the three card names. Harden once a real scene exists and
  stray targets are observable.
- `AGENTS.md` and `CLAUDE.md` at the repo root are generated and
  re-added by `next dev`; committing them keeps the tree clean.
- `@types/node` was bumped `^20`→`^24` to clear a hard ERESOLVE against
  `vitest@5`. It matches the Node 24 runtime.

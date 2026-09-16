# Spline scene integration — report

Branch: `feat/spline-scene-integration`. This report covers parts 2–4 of the
brief (the persistent Spline layer, the phase machine, the 2D fallback, and
the unset-scene-URL story). Part 1 (the `brutalist` -> `retro` rename) was
completed and committed earlier in this session as `3073d45` and is not
re-described here.

## What was built

### Architecture split: `ThemeRenderer` now only picks a flow

`ThemeRenderer.tsx` used to own both the picker/site swap logic and the
picker-variant decision (via `PickerGate`). It's now a thin dispatcher:

```
ThemeRenderer
  -> choosePickerVariant(...)   // unchanged, from lib/device-support.ts
     -> 'spline' -> SplineFlow (components/spline/SplineFlow.tsx)
     -> '2d'     -> TwoDFlow   (components/TwoDFlow.tsx)
```

`choosePickerVariant` itself was not touched. `TwoDFlow.tsx` is the old
`ThemeRenderer` body verbatim (picker/site swap via `motion.div`, the
`AnimatePresence`-avoidance comment preserved word-for-word in substance),
just renamed and pointed at `CardPicker2D` directly instead of through
`PickerGate`. **The 2D fallback's behavior is unchanged** — same component,
same animation, same instant cross-fade, and it does not import or touch
anything Spline-related.

`PickerGate.tsx` and the old `SplinePicker.tsx` (the "pick and immediately
swap" component) were deleted. Their job — deciding the variant, and
turning a Spline click into an immediate theme swap — no longer fits: the
variant decision now has to happen before we know whether to mount a
persistent 3D layer at all, and a Spline click no longer swaps anything
immediately (it starts an 800ms zoom first). Keeping them around as unused
scaffolding seemed worse than removing them; `SplineSceneLayer.tsx` is
their replacement, described below.

### The phase machine

`lib/scene-phase.ts` defines the phase type and two named constants:

```ts
export type ScenePhase = 'scene' | 'zoomingIn' | 'site' | 'fadingOut' | 'zoomingOut';
export const SPLINE_ZOOM_MS = 800;   // mirrors Card_* MouseDown -> FullScreen tween in Spline
export const BLACK_FADE_MS = 250;    // our own black cross-fade, no Spline analog
```

`components/spline/useSplineSceneMachine.ts` is a hook that owns the phase
machine and nothing else — no rendering, no DOM. It exposes `phase`,
`activeTheme`, and three callbacks (`handleAppLoad`, `handleCardMouseDown`,
`handleSwitcherClick`). Design choices:

- **Every automatic transition is a `setTimeout` inside a `useEffect` keyed
  on the phase that starts it** (`zoomingIn` schedules the move to `site`,
  `fadingOut` schedules the move to `zoomingOut`, `zoomingOut` schedules the
  move back to `scene`). This is the direct answer to the brief's timing
  requirement: a `setTimeout` in a backgrounded tab gets throttled by the
  browser but always eventually fires, unlike the Web Animations API's
  `finished` promise the codebase already found does not resolve while
  hidden (see the preserved comment in `TwoDFlow.tsx`, and its restatement
  in the hook's own doc comment). Nothing in the machine awaits an
  animation completion callback.
- **The reverse zoom fires from a `useEffect` on entering `zoomingOut`, not
  from the click handler.** The site only renders while `phase` is `'site'`
  or `'fadingOut'`. By the time the effect that fires
  `emitEventReverse` runs, React has already committed the render where
  `phase` became `'zoomingOut'` — which is the same render that removes the
  site from the tree. Effects run after commit, so this ordering is
  structural, not timing-dependent: the site is provably gone by the time
  `emitEventReverse` is called, not just usually gone by then. The
  `SplineFlow.test.tsx` test "unmounts the site before playing the reverse
  zoom" asserts exactly this.
- **`handleCardMouseDown` and `handleSwitcherClick` are no-ops outside their
  expected phase** (`scene` and `site` respectively), so a stray or
  double-fired event can't double-schedule a transition or fire
  `emitEventReverse` twice. Covered by the "does not let the switcher
  trigger a second reverse zoom mid-transition" test.
- The live `Application` instance is captured once via `onLoad` into a
  `ref` (not state — it's an escape hatch to an external system, not
  something that should trigger a re-render) and reused for the reverse
  call. It is never re-fetched or the scene never reloaded.

### The persistent layer

`components/spline/SplineSceneLayer.tsx` renders the actual `<Spline>`
element. `components/spline/SplineFlow.tsx` mounts it once, unconditionally,
for the component's entire lifetime — it is not keyed on `activeTheme` or
`phase` the way the site content is. Above it:

- The active theme's component tree renders only while `phase` is `'site'`
  or `'fadingOut'` (`z-10`, so it visually sits over the canvas).
- A `fixed inset-0` black `div` (`z-20`) is always mounted; its `opacity`
  is driven directly by `phase === 'fadingOut'` and transitions purely via
  CSS (`transition-opacity`, duration bound to `BLACK_FADE_MS`). No
  `AnimatePresence`, no `exit` prop, no `onAnimationComplete` — the phase
  machine doesn't know or care whether the browser actually painted the
  fade; it advances on its own timer regardless.
- `SplineSceneLayer`'s `interactive` prop is `phase === 'scene'`, which
  toggles `pointer-events: none` off the canvas the instant a zoom starts.
  Once the site is up, the canvas underneath cannot swallow clicks meant
  for it.
- The floating switcher (reused `FloatingSwitcher`, now taking an optional
  `onClick` override so it can be wired to `handleSwitcherClick` instead of
  the global `ThemeContext.reopenPicker`) only renders during `phase ===
  'site'`.

### The unset-scene-URL story

Nothing new was needed here beyond what already existed:
`choosePickerVariant` already resolves to `'2d'` whenever `hasSceneUrl` is
false, so with `NEXT_PUBLIC_SPLINE_SCENE_URL` unset, `ThemeRenderer` never
mounts `SplineFlow`, `SplineSceneLayer`, or the `@splinetool/react-spline`
import path at runtime — it takes the `TwoDFlow` branch every time, exactly
as before this change. No placeholder URL was invented or committed. The
moment the owner sets the env var (and WebGL/reduced-motion checks pass),
`ThemeRenderer` starts mounting `SplineFlow` with no further code changes.

## Files changed

- `lib/scene-phase.ts` — new. Phase type + `SPLINE_ZOOM_MS` / `BLACK_FADE_MS`.
- `components/spline/useSplineSceneMachine.ts` — new. The phase machine hook.
- `components/spline/SplineSceneLayer.tsx` — new. Persistent Spline canvas wrapper (successor to `SplinePicker.tsx`).
- `components/spline/SplineFlow.tsx` — new. Composes the layer, site, overlay, switcher.
- `components/spline/SplineFlow.test.tsx` — new. Phase-machine + persistence tests (below).
- `components/TwoDFlow.tsx` — new. The old `ThemeRenderer` body, unchanged in substance, retargeted at `CardPicker2D`.
- `components/TwoDFlow.test.tsx` — new. The old `ThemeRenderer.test.tsx`, retargeted.
- `components/ThemeRenderer.tsx` — rewritten. Now just the variant dispatch.
- `components/ThemeRenderer.test.tsx` — rewritten. Now tests the dispatch (mirrors old `PickerGate.test.tsx`'s coverage).
- `components/ThemeRenderer.roundtrip.test.tsx` — comment/describe text updated to say `TwoDFlow` instead of `PickerGate`; behavior/assertions unchanged.
- `components/FloatingSwitcher.tsx` — added an optional `onClick` prop, defaulting to `useTheme().reopenPicker` (backward compatible; `FloatingSwitcher.test.tsx` needed no changes).
- `components/picker/PickerGate.tsx`, `components/picker/PickerGate.test.tsx`, `components/picker/SplinePicker.tsx`, `components/picker/SplinePicker.test.tsx` — deleted (superseded, see above).
- `components/picker/CardPicker2D.tsx` — untouched.

Rename-only files from the earlier `3073d45` commit are not relisted here.

## Real command output

```
$ npx vitest run
 Test Files  19 passed (19)
      Tests  50 passed (50)
   Duration  3.72s

$ npx tsc --noEmit
(no output — clean)

$ npm run build
✓ Compiled successfully in 940ms
  Running TypeScript ...
  Finished TypeScript in 1227ms ...
✓ Generating static pages using 6 workers (5/5) in 474ms
Route (app)
┌ ○ /
├ ○ /_not-found
└ ƒ /api/contact
```

19 test files, 50 tests (46 pre-existing + 4 new in `SplineFlow.test.tsx`).
All observed directly, not reconstructed.

I also ran `npx eslint` against every file I touched or added. It reports
zero issues on my files. It does report two pre-existing errors in
`lib/device-support.ts` (`react-hooks/set-state-in-effect` on both hooks) —
that file is untouched by this work and out of scope per the brief ("well
tested, reuse it, don't reimplement"), so I left it as-is rather than
silently changing a file the brief says not to touch. Flagging it here so
it isn't mistaken for something I introduced.

## What I could not verify

jsdom cannot run WebGL or the real Spline runtime, and
`NEXT_PUBLIC_SPLINE_SCENE_URL` is still unset (per the brief, I did not
invent or commit a value). So, plainly: **nothing about the actual Spline
scene's runtime behavior was verified** — not the hover/fullscreen state
transitions, not the authored 800ms timing, not that `emitEvent` /
`emitEventReverse` actually drive the real scene the way `runtime.d.ts`
documents, not that `Card_Apple` / `Card_Retro` / `Card_Terminal` are the
exact mesh names the live scene uses (I'm relying on the brief's inspection
notes for that), and not the visual result of layering the site over the
canvas or the black cross-fade. All of `SplineFlow.test.tsx`'s coverage is
against a hand-written mock of `@splinetool/react-spline` that calls
`onLoad`/`onSplineMouseDown` the way the brief and the runtime's
`.d.ts` say the real component does — it verifies our phase-machine logic
reacts correctly to those calls, not that the real component makes them
correctly or on the same schedule.

What the test suite *does* verify, mechanically, with fake timers and the
mock in place:

- The site is absent during `zoomingIn` and present after `SPLINE_ZOOM_MS`.
- The switcher only appears once the site is up.
- Clicking the switcher does not immediately remove the site or fire the
  reverse call — both happen only after `BLACK_FADE_MS`.
- `emitEventReverse` is called exactly once, with `('mouseDown',
  'Card_Apple')` for the card that was actually clicked, and only after
  the site has already been removed from the document.
- The mocked `<Spline>` component's mount effect runs exactly once across
  an entire pick -> switch -> re-pick cycle — i.e. the persistent-layer
  property the whole feature depends on.
- A second switcher click during the fading-out/zooming-out window can't
  fire a second reverse call (there's no switcher to click by then).

## Where I'd want a reviewer to look hardest

1. **The `useEffect`-fires-`emitEventReverse`-on-phase-entry pattern in
   `useSplineSceneMachine.ts`.** I'm relying on React's commit-then-effect
   ordering to guarantee the site unmounts before the reverse call fires.
   That ordering holds under React's documented semantics and is what the
   test asserts, but it's worth a second pair of eyes given how load-bearing
   it is for the "site is gone before zoom-out starts" requirement.
2. **`FloatingSwitcher`'s new optional `onClick` prop.** I chose to reuse
   the existing component rather than write a second switcher, on the
   theory that the visible control should look and read identically in
   both flows. The prop defaults to the original `useTheme().reopenPicker`
   behavior so the existing test needed no changes, but it does mean
   `FloatingSwitcher` now has two call sites with two different notions of
   "switch" (global theme context vs. local phase machine) — worth
   confirming that's the right level of shared abstraction rather than a
   leaky one.
3. **Deleting `PickerGate`/`SplinePicker` instead of adapting them.** This
   was a judgment call (the brief explicitly leaves the phase machine's
   decomposition to me) — I concluded their responsibilities didn't survive
   the restructuring intact, rather than trying to preserve the files at
   the cost of a less honest interface. Worth checking I didn't remove
   something a reviewer expected to still exist in some form.
4. **The `pointer-events` gating on `SplineSceneLayer`.** It's driven by a
   single boolean (`phase === 'scene'`) rather than anything more granular,
   on the assumption that no interaction with the canvas is needed during
   `zoomingIn` or `zoomingOut` — the zoom is fully programmatic on both
   ends. If a future revision wants hover effects to keep working during
   the zoom, this will need revisiting.
5. **The two pre-existing `device-support.ts` lint errors.** Confirmed they
   predate this branch's work and are unrelated to this feature; left
   untouched per the brief's instruction not to reimplement/touch that
   file. Flagging in case the project wants them fixed separately.

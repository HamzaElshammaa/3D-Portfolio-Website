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

## Fix round 1 (post-review)

The review came back "fix before shipping" with two Important findings and
a couple of defensive/smaller items. What follows is what changed in
response, and the real verification for it.

### 1. (Important) Unified `activeTheme` into `ThemeContext`

`useSplineSceneMachine` no longer keeps its own `activeTheme` state. It now
reads `activeTheme` and calls `selectTheme` / `reopenPicker` from
`useTheme()` (`lib/theme-context.tsx`), which was already the app's single
source of truth for "what theme is active" on the 2D path. Only `phase`
remains machine-local state, since it has no equivalent anywhere else in
the app.

- `handleCardMouseDown` now calls `selectTheme(themeId)` (instead of a
  local `setActiveTheme`) before moving to `zoomingIn`.
- The `zoomingOut -> scene` transition now calls `reopenPicker()` (instead
  of a local `setActiveTheme(null)`) in the same `setTimeout` that resets
  `phase` to `'scene'`.
- `SplineFlow` and `SplineFlow.test.tsx`'s `ActiveThemeProbe` read
  `ThemeContext.activeTheme` directly to confirm it now tracks the phase
  machine instead of staying `null` forever on the Spline path.

I tried the unification first as asked, and it worked cleanly — there was
no concrete blocker, so there's no context split to document. New test:
`SplineFlow.test.tsx` — "drives the real ThemeContext.activeTheme instead
of keeping a second, silent copy" — asserts the context value through the
full pick -> site -> switch -> scene cycle, including that it updates
**the instant** the card is clicked (not only once the zoom finishes) and
stays at the outgoing theme through the reverse zoom until the machine is
fully back at `scene`.

### 2. (Important) Load-failure fallback

Checked `node_modules/@splinetool/react-spline/dist/Spline.d.ts` directly,
as asked, rather than assuming: `SplineProps` has `onLoad` and seven
`onSpline*` event props, and no error/failure callback of any kind. So a
scene that never resolves (404, dropped connection, bad URL) gives no
signal to react to — `onLoad` just never fires.

Added:

- `SPLINE_LOAD_TIMEOUT_MS = 8000` in `lib/scene-phase.ts`, alongside the
  other two named durations, with a comment stating the typings check and
  the reasoning for the value (generous for a real load, still bounded).
- `components/spline/useSceneLoadWatchdog.ts` — a small one-shot hook:
  starts an `SPLINE_LOAD_TIMEOUT_MS` timer on mount, exposes `timedOut`
  and a `markLoaded` callback. Once `timedOut` flips true it never flips
  back (there's no code path that resets it), which is what makes the
  fallback one-way.
- `components/spline/SplineFlowGate.tsx` — sits between `ThemeRenderer`
  and `SplineFlow`. Renders `SplineFlow` (wired so its first `onLoad`
  calls `markLoaded`) until the watchdog times out, then renders `TwoDFlow`
  instead, permanently, for the rest of that mount. `ThemeRenderer` now
  points at `SplineFlowGate` instead of `SplineFlow` directly.
- `SplineFlow` gained an optional `onSceneLoaded` prop that its own
  `handleLoad` wrapper calls before forwarding to
  `useSplineSceneMachine`'s `handleAppLoad`.

"Must not fight the machine if the scene loads late": once `timedOut` is
true, `SplineFlowGate` renders `TwoDFlow` and `SplineFlow` (and the
Spline canvas under it) is unmounted — there is no longer a component in
the tree that could call `markLoaded` even if the underlying scene promise
did eventually resolve, so there's no reconciliation to get wrong. Tested
directly in `SplineFlowGate.test.tsx`: renders `SplineFlow` before the
timeout, falls back to `TwoDFlow` when the timeout elapses with no load,
does *not* fall back if `onSceneLoaded` fires first, and — the one-way
check — advancing time further after the fallback has already happened
changes nothing (there's nothing left mounted to fire the late load).

### 3. (Defensive) Group-name aliases + diagnosable misses

`SplineSceneLayer.tsx`'s `OBJECT_NAME_TO_THEME` now maps both the card
mesh name and its parent group's name (derived as
`splineObjectName.replace(/^Card_/, 'Group_')`, not a second hardcoded
list) to the same theme id, so `Group_Apple` / `Group_Retro` /
`Group_Terminal` work as aliases for `Card_Apple` / `Card_Retro` /
`Card_Terminal`. When a `MouseDown` arrives with a name matching neither,
it now logs `console.warn` naming the exact unmapped object, gated on
`process.env.NODE_ENV !== 'production'`.

New test file `SplineSceneLayer.test.tsx` covers all three paths
directly against the real (mocked) `onSplineMouseDown` callback: a card
name resolves correctly, a group name resolves to the same theme, and an
unrecognized name triggers a `console.warn` containing that name and does
not call `onCardMouseDown`.

### Smaller items

- `useSplineSceneMachine`'s `zoomingOut` effect now logs a
  `console.warn` (dev-only) instead of silently skipping when it can't
  fire the reverse call (`activeTheme` unset or the `Application` never
  loaded), naming which of the two conditions failed.
- `SplineSceneLayer`'s wrapper `className` is now `fixed inset-0 z-0` —
  dropped the redundant `h-screen w-full` (a `fixed inset-0` element is
  already sized to the viewport on all four edges).
- `FloatingSwitcher`'s `onClick` prop now has a doc comment stating the
  default (`reopenPicker`) is the 2D flow's behavior and the override is
  the Spline flow's.

### Verification (real output)

```
$ npx vitest run
 Test Files  21 passed (21)
      Tests  59 passed (59)
   Duration  4.41s

$ npx tsc --noEmit
(no output — clean)

$ npm run build
✓ Compiled successfully in 1537ms
  Running TypeScript ...
  Finished TypeScript in 1378ms ...
✓ Generating static pages using 6 workers (5/5) in 470ms

$ npx eslint components/spline components/ThemeRenderer.tsx components/ThemeRenderer.test.tsx components/FloatingSwitcher.tsx lib/scene-phase.ts
(no output — clean)
```

21 test files / 59 tests (up from 19 files / 50 tests): four new files
(`SplineFlowGate.test.tsx`, `SplineSceneLayer.test.tsx`) plus one new case
appended to `SplineFlow.test.tsx`, on top of the existing suite untouched
in behavior.

### What's still unverified, and why

Same limitation as before, now applied to the new code: jsdom cannot run
the real `@splinetool/react-spline` component, so none of this — the
load-timeout fallback, the group-alias lookup, the unified context value —
has been exercised against the actual published scene, because
`NEXT_PUBLIC_SPLINE_SCENE_URL` is still unset. Specifically unverified:

- Whether 8 seconds is actually the right timeout for the real scene's
  load time on a real connection — chosen as a reasonable bound, not
  measured against anything real.
- Whether the real `<Spline>` component's promise-based load path behaves
  the way my hand-written mock assumes (calls `onLoad` once, exactly, with
  a live `Application`) under an actual network failure/404 rather than
  just "never calls onLoad" — I modeled the failure mode as "onLoad never
  fires," which is the one thing the typings and the brief both support,
  but a real 404 might do something else first (e.g. reject a promise
  internally that surfaces as an uncaught rejection rather than a hang).
  That would be a different bug than the one this fallback fixes, and I
  have no way to observe it here.
- Whether `Group_Apple` etc. are the actual group names in the live scene
  — taken from the brief's stated MCP inspection, not re-verified by me
  against the scene itself.

## Fix round 2 (live-runtime bug: reverse zoom self-triggers a new zoom-in)

The scene URL landed and the coordinator ran the real thing in a browser.
Everything structural held up (persistence, unmount-before-reverse
ordering, object/event names, `choosePickerVariant` as sole decision
point) — but a real bug only the live runtime could expose: after the
zoom-out finished, the site came back on its own and the machine ended in
`site` instead of `scene`.

### Root cause

`Application.emitEventReverse('mouseDown', ...)` doesn't just play the
authored tween backwards — it re-emits an actual `mouseDown` event on the
card object, which arrives right back at our own `onSplineMouseDown`
listener. The `@splinetool/react-spline` runtime registers that listener
once, when the scene first loads, and never rebinds it to a fresh prop on
re-render. So `handleCardMouseDown`'s old `useCallback([phase, ...])`
guard was still running the very first render's closure — `phase ===
'scene'`, the initial state — when the self-inflicted event arrived during
`zoomingOut`. The `phase !== 'scene'` check passed, `selectTheme` ran, and
`setPhase('zoomingIn')` started a whole new zoom-in. The measured timeline
matched exactly: reverse fires at `BLACK_FADE_MS` (~250ms) into
`zoomingOut`, a fresh zoom-in takes `SPLINE_ZOOM_MS` (800ms), and
250 + 800 = 1050 — precisely when the site reappeared live.

### Fix

`useSplineSceneMachine.ts` now mirrors `phase` into a `phaseRef` (kept
current via a `useEffect` on `phase`), and `handleCardMouseDown` /
`handleSwitcherClick` both check `phaseRef.current` instead of the
`phase` they close over. This makes both callbacks correct regardless of
which render's closure the Spline runtime happened to freeze, because the
check reads through a stable ref object rather than a captured primitive.
As a side effect, both callbacks' `useCallback` dependency arrays shrank
(`handleCardMouseDown` now only depends on `selectTheme`, itself stable;
`handleSwitcherClick` has no deps at all) — they're now the same function
reference for the lifetime of the component, which is itself part of why
the fix is robust: there's no "latest" closure to miss.

**Ref guard alone, not a separate suppression flag.** I considered adding
an explicit "ignore card events while reverse-emitting" flag, since a
self-inflicted event is arguably something to suppress at the source. I
didn't, because the ref guard already covers exactly that window and
nothing more: `handleCardMouseDown` requires `phaseRef.current === 'scene'`,
and the machine is in `'scene'` only after the reverse zoom has fully
finished — so any self-emitted event landing during `zoomingOut` (or any
other non-`scene` phase) is already rejected by the same check every other
out-of-phase call goes through. A separate flag would track information
the phase already tracks, for a window (`zoomingOut`) the phase already
names precisely.

**Confirmed there's nothing else exposed:** `handleAppLoad` only writes
`appRef.current = app` — no state read, so no closure to go stale.
`handleCardMouseDown` and `handleSwitcherClick` were the only two
Spline-registered callbacks reading component state, and both are fixed.

### Verified live, against the real scene

With the fix in place and `.env.local`'s real scene URL active, I drove
the actual flow in the browser (not just jsdom):

1. Loaded `localhost:3000` — the real Spline canvas rendered, three cards,
   no 2D fallback.
2. Clicked the left card — Apple theme mounted correctly with its real
   hero heading and the switcher.
3. Clicked "Switch design" — screenshotted immediately after (~1s) and
   again ~4s later. In both, the visitor was back at the three-card scene
   with **no site content and no switcher** — reproducing the reviewer's
   exact repro steps and confirming the site does not reappear at
   t≈1100ms the way it did before the fix.
4. Clicked the third card — the Terminal "coming soon" placeholder mounted
   correctly, confirming the cycle still repeats after a full round trip.

This is the one part of this project I could actually verify against the
real runtime rather than a mock, and it confirms the fix.

### Regression test

Rewrote `SplineFlow.test.tsx`'s Spline mock to be faithful to the real
bug's precondition instead of glossing over it: `onSplineMouseDown` is now
captured via `useRef`'s lazy initializer (reads only the very first
render's value, exactly like the real runtime's one-time registration),
and the mocked `emitEventReverse` re-invokes that frozen handler with the
same object name — modeling the actual "reverse call re-emits a mouseDown"
behavior, not just its transition-completion side effect. This is a
stricter mock than before: a fix that only worked because the old mock
read `onSplineMouseDown` fresh every render would fail against it.

New test, `'regression: a self-emitted mouseDown from emitEventReverse
cannot restart a new zoom-in'`: runs the full pick -> site -> switch
sequence, confirms `emitEventReverse` fires and immediately re-triggers
`onSplineMouseDown` for the same card, then advances time well past where
a spuriously-accepted zoom-in would have completed and put the site back
up. Asserts: no heading, no switcher, `ThemeContext.activeTheme` is back
to `null`, and `emitEventReverse` was called exactly once (the self-emitted
event must not have been accepted as a new pick that would trigger its own
second reverse).

I confirmed this test is a real regression test, not just new coverage
that happens to pass: I temporarily reverted `useSplineSceneMachine.ts` to
its pre-fix (commit `d88589b`) version and reran `SplineFlow.test.tsx` —
both the new regression test and the existing "drives the real
ThemeContext.activeTheme" test failed against the now-stricter mock (the
latter failed because the phantom zoom-in left `activeTheme` as `'apple'`
instead of returning it to `null`). I then restored the fixed version and
confirmed the full suite passes again.

### Verification (real output)

Reverted to the pre-fix hook, to prove the regression test is real:

```
$ npx vitest run components/spline/SplineFlow.test.tsx
 ❯ components/spline/SplineFlow.test.tsx (6 tests | 2 failed)
   × drives the real ThemeContext.activeTheme instead of keeping a second, silent copy
     Expected: none   Received: apple
   × regression: a self-emitted mouseDown from emitEventReverse cannot restart a new zoom-in
     expected document not to contain element, found <h1 ...>
```

Restored the fix:

```
$ npx vitest run
 Test Files  21 passed (21)
      Tests  60 passed (60)
   Duration  5.93s

$ npx tsc --noEmit
(no output — clean)

$ npm run build
- Environments: .env.local
✓ Compiled successfully in 2.9s
  Running TypeScript ...
  Finished TypeScript in 1355ms ...
✓ Generating static pages using 6 workers (5/5) in 485ms

$ npx eslint components/spline/SplineFlow.test.tsx components/spline/useSplineSceneMachine.ts
(no output — clean)
```

`.env.local` is present locally (confirmed via `git check-ignore -v
.env.local`, matched by `.gitignore:34:.env*`) and was read by `next
build` for this run, but `git status --short` before and after this round
showed only the two files actually edited — it was never staged or
committed.

### What's still unverified

Everything else from round 1's "what's still unverified" section still
applies: the load-timeout fallback and the group-name alias have not been
exercised against a real failed load or a real misattributed click,
because the scene loads cleanly and attributes clicks to the card mesh as
expected — confirmed live: no unmapped-name warning appeared while
clicking through cards during the manual run. The one thing this round
newly verifies against the real runtime is the exact bug reported and its
fix.

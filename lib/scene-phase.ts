/**
 * The Spline-driven picker's session state machine.
 *
 * `scene`      — the 3D scene is interactive; no site, no switcher.
 * `zoomingIn`  — a card's authored MouseDown -> FullScreen tween is
 *                playing in Spline; React is waiting it out.
 * `site`       — the fullscreen card is showing; the themed site is
 *                rendered above it and the switcher is available.
 * `fadingOut`  — the visitor asked to switch; a black overlay is fading
 *                in over the site.
 * `zoomingOut` — the site has been unmounted, the Spline tween is
 *                playing in reverse, and the black overlay is fading
 *                back out to reveal it.
 *
 * The cycle is: scene -> zoomingIn -> site -> fadingOut -> zoomingOut -> scene.
 */
export type ScenePhase = 'scene' | 'zoomingIn' | 'site' | 'fadingOut' | 'zoomingOut';

/**
 * Duration (ms) of the `MouseDown -> FullScreen` transition authored on
 * each card object (`Card_Apple` / `Card_Retro` / `Card_Terminal`) inside
 * the Spline scene itself: 800ms, ease-in-out. React never plays this
 * animation — Spline does, via `emitEvent`/`emitEventReverse` — but it has
 * to know how long to wait before revealing (or, in reverse, before
 * settling) the site. If the tween is retimed inside Spline, this is the
 * one place in the app that needs to change to match.
 */
export const SPLINE_ZOOM_MS = 800;

/**
 * Duration (ms) of the black cross-fade used to mask the moment the site
 * unmounts and the Spline scene's reverse zoom begins. Purely a UI choice
 * (unlike SPLINE_ZOOM_MS, nothing in Spline dictates this number), kept as
 * a named constant for the same reason: one place to retime it.
 */
export const BLACK_FADE_MS = 250;

/**
 * How long we wait for the Spline scene to call `onLoad` before giving up
 * and falling back to `TwoDFlow`. `<Spline>`'s typings expose no error
 * callback (checked `Spline.d.ts` — `onLoad` is the only load-lifecycle
 * prop), so a scene that 404s or stalls on a dropped connection would
 * otherwise never resolve and never reject: the visitor would sit on a
 * blank canvas forever with no way into the site. 8s is generous for a
 * genuine WebGL scene load on a normal connection while still being a
 * bounded wait rather than an indefinite one. The fallback this triggers
 * is one-way — see `SplineFlowGate`.
 */
export const SPLINE_LOAD_TIMEOUT_MS = 8000;

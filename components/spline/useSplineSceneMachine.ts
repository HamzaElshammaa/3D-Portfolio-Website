'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Application } from '@splinetool/runtime';
import type { ThemeId } from '@/lib/theme-context';
import { THEMES, useTheme } from '@/lib/theme-context';
import { BLACK_FADE_MS, SPLINE_ZOOM_MS, type ScenePhase } from '@/lib/scene-phase';

export interface SplineSceneMachine {
  phase: ScenePhase;
  /** The theme whose card is currently zoomed in / zooming, or null in `scene`. */
  activeTheme: ThemeId | null;
  /** Wire to Spline's `onLoad` to capture the live `Application` instance. */
  handleAppLoad: (app: Application) => void;
  /** Wire to a card's MouseDown. No-op unless the machine is in `scene`. */
  handleCardMouseDown: (themeId: ThemeId) => void;
  /** Wire to the floating switcher. No-op unless the machine is in `site`. */
  handleSwitcherClick: () => void;
}

/**
 * Owns the scene -> zoomingIn -> site -> fadingOut -> zoomingOut -> scene
 * phase machine described in `lib/scene-phase.ts`.
 *
 * `activeTheme` is deliberately NOT local state here — it's read straight
 * from `ThemeContext`, and `handleCardMouseDown` / the return-to-`scene`
 * transition drive it via `selectTheme` / `reopenPicker`. An earlier
 * version kept its own copy, which meant `ThemeContext.activeTheme` stayed
 * `null` for the entire Spline session — invisible today because nothing
 * reads it, but a trap for the first bit of chrome (a `<title>`, analytics,
 * a header) that assumes it reflects reality. `phase` has no equivalent in
 * `ThemeContext` and stays local — it's this hook's own concept, not
 * something the 2D flow or the rest of the app needs to know about.
 *
 * Every automatic transition (zoomingIn -> site, fadingOut -> zoomingOut,
 * zoomingOut -> scene) is driven by a plain `setTimeout` in a `useEffect`
 * keyed on the phase that starts it, deliberately NOT by an animation's
 * completion callback (framer-motion `onAnimationComplete`, or an
 * `AnimatePresence`/`exit` + WAAPI `finished` promise). See the long
 * comment in `TwoDFlow.tsx` for why: that promise does not resolve while
 * the tab is hidden, which previously wedged the (2D) switcher
 * permanently. A `setTimeout` fires late in a backgrounded tab — browsers
 * throttle background timers — but it always eventually fires, so the
 * machine can be delayed but never stranded mid-phase.
 *
 * `handleCardMouseDown` / `handleSwitcherClick` guard against a stale
 * closure by reading `phaseRef.current` rather than the `phase` captured
 * in their own closure. This isn't defensive paranoia: `emitEventReverse`
 * doesn't just play the authored tween backwards, it *emits a real
 * `mouseDown` event* on the card object, which our own `onSplineMouseDown`
 * listener receives right back. The Spline runtime registers that
 * listener once, when the scene first loads, and never rebinds it to a
 * fresh prop — so a plain `useCallback([phase])` guard would still be
 * running the very first render's closure (`phase === 'scene'`) when the
 * self-inflicted event arrives during `zoomingOut`, incorrectly pass the
 * `phase !== 'scene'` check, and kick off a brand-new zoom-in. That is
 * exactly the bug this ref exists to prevent: verified live, the
 * self-emitted event landed ~250ms after the reverse zoom started, and
 * `250 + SPLINE_ZOOM_MS` is precisely when the site reappeared. A ref
 * guard is sufficient on its own — every entry point re-checks
 * `phaseRef.current` against the phase it actually requires, so a
 * self-inflicted event arriving during `zoomingOut` is rejected by
 * `handleCardMouseDown`'s `!== 'scene'` check the same as any other
 * out-of-phase call would be. A separate "ignore card events while
 * reverse-emitting" flag would duplicate that same information (the
 * window it would cover is exactly the `zoomingOut` phase) for no benefit.
 */
export function useSplineSceneMachine(): SplineSceneMachine {
  const { activeTheme, selectTheme, reopenPicker } = useTheme();
  const [phase, setPhase] = useState<ScenePhase>('scene');
  const phaseRef = useRef<ScenePhase>('scene');
  const appRef = useRef<Application | null>(null);

  // Keeps `phaseRef.current` current for callbacks a stale closure might
  // be holding — see the guard rationale above.
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const handleAppLoad = useCallback((app: Application) => {
    appRef.current = app;
  }, []);

  const handleCardMouseDown = useCallback(
    (themeId: ThemeId) => {
      if (phaseRef.current !== 'scene') return;
      selectTheme(themeId);
      setPhase('zoomingIn');
    },
    [selectTheme]
  );

  const handleSwitcherClick = useCallback(() => {
    if (phaseRef.current !== 'site') return;
    setPhase('fadingOut');
  }, []);

  // zoomingIn -> site, once Spline's own zoom tween has finished playing.
  useEffect(() => {
    if (phase !== 'zoomingIn') return;
    const timeoutId = setTimeout(() => setPhase('site'), SPLINE_ZOOM_MS);
    return () => clearTimeout(timeoutId);
  }, [phase]);

  // fadingOut -> zoomingOut, once the black overlay has fully faded in.
  useEffect(() => {
    if (phase !== 'fadingOut') return;
    const timeoutId = setTimeout(() => setPhase('zoomingOut'), BLACK_FADE_MS);
    return () => clearTimeout(timeoutId);
  }, [phase]);

  // Entering zoomingOut is the moment the site has just been unmounted
  // (it only renders during 'site' / 'fadingOut') and the overlay is
  // fully opaque. Fire the reverse tween now — the effect runs after
  // React has committed that unmount, so the site is guaranteed gone
  // before emitEventReverse is called — then schedule the return to
  // `scene` for when the reverse tween finishes.
  useEffect(() => {
    if (phase !== 'zoomingOut') return;
    if (activeTheme && appRef.current) {
      appRef.current.emitEventReverse('mouseDown', THEMES[activeTheme].splineObjectName);
    } else if (process.env.NODE_ENV !== 'production') {
      // Either the scene never finished loading (appRef.current is still
      // null) or activeTheme was somehow cleared before the reverse tween
      // could fire — both mean the visitor won't see the card zoom back
      // out. Not fatal (the timer below still returns the machine to
      // `scene`), but worth knowing about during development.
      console.warn(
        `useSplineSceneMachine: skipped emitEventReverse (activeTheme=${String(
          activeTheme
        )}, application loaded=${Boolean(appRef.current)})`
      );
    }
    const timeoutId = setTimeout(() => {
      setPhase('scene');
      reopenPicker();
    }, SPLINE_ZOOM_MS);
    return () => clearTimeout(timeoutId);
  }, [phase, activeTheme, reopenPicker]);

  return { phase, activeTheme, handleAppLoad, handleCardMouseDown, handleSwitcherClick };
}

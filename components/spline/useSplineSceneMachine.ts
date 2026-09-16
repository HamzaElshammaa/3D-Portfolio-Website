'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Application } from '@splinetool/runtime';
import type { ThemeId } from '@/lib/theme-context';
import { THEMES } from '@/lib/theme-context';
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
 */
export function useSplineSceneMachine(): SplineSceneMachine {
  const [phase, setPhase] = useState<ScenePhase>('scene');
  const [activeTheme, setActiveTheme] = useState<ThemeId | null>(null);
  const appRef = useRef<Application | null>(null);

  const handleAppLoad = useCallback((app: Application) => {
    appRef.current = app;
  }, []);

  const handleCardMouseDown = useCallback(
    (themeId: ThemeId) => {
      if (phase !== 'scene') return;
      setActiveTheme(themeId);
      setPhase('zoomingIn');
    },
    [phase]
  );

  const handleSwitcherClick = useCallback(() => {
    if (phase !== 'site') return;
    setPhase('fadingOut');
  }, [phase]);

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
    }
    const timeoutId = setTimeout(() => {
      setPhase('scene');
      setActiveTheme(null);
    }, SPLINE_ZOOM_MS);
    return () => clearTimeout(timeoutId);
  }, [phase, activeTheme]);

  return { phase, activeTheme, handleAppLoad, handleCardMouseDown, handleSwitcherClick };
}

'use client';

import { themeRegistry } from '@/themes/registry';
import { BLACK_FADE_MS } from '@/lib/scene-phase';
import { FloatingSwitcher } from '../FloatingSwitcher';
import { SplineSceneLayer } from './SplineSceneLayer';
import { useSplineSceneMachine } from './useSplineSceneMachine';

/**
 * The Spline-backed picker/site flow (used when `choosePickerVariant`
 * resolves to `'spline'`). Unlike `TwoDFlow`, the 3D scene is not swapped
 * out for the site — it sits underneath it for the entire session. See
 * `SplineSceneLayer` and `useSplineSceneMachine` for why.
 */
export function SplineFlow({ sceneUrl }: { sceneUrl: string }) {
  const { phase, activeTheme, handleAppLoad, handleCardMouseDown, handleSwitcherClick } =
    useSplineSceneMachine();

  const ActiveTheme = activeTheme ? themeRegistry[activeTheme] : null;
  const showSite = (phase === 'site' || phase === 'fadingOut') && ActiveTheme !== null;
  const overlayOpaque = phase === 'fadingOut';

  return (
    <>
      <SplineSceneLayer
        sceneUrl={sceneUrl}
        interactive={phase === 'scene'}
        onLoad={handleAppLoad}
        onCardMouseDown={handleCardMouseDown}
      />

      {showSite && ActiveTheme && (
        <div className="relative z-10">
          <ActiveTheme />
        </div>
      )}

      {/*
       * A plain opacity-driven div — not an AnimatePresence/exit fade. See
       * the comment in `useSplineSceneMachine.ts` (and its twin in
       * `TwoDFlow.tsx`) for why correctness must never hinge on an
       * animation's own completion signal: the phase machine advances on
       * setTimeout durations it owns, so this overlay is free to use a CSS
       * transition purely for looks, with no code path awaiting it.
       */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-20 bg-black transition-opacity"
        style={{ opacity: overlayOpaque ? 1 : 0, transitionDuration: `${BLACK_FADE_MS}ms` }}
      />

      {phase === 'site' && (
        <div className="relative z-30">
          <FloatingSwitcher onClick={handleSwitcherClick} />
        </div>
      )}
    </>
  );
}

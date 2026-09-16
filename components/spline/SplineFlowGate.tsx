'use client';

import { TwoDFlow } from '../TwoDFlow';
import { SplineFlow } from './SplineFlow';
import { useSceneLoadWatchdog } from './useSceneLoadWatchdog';

/**
 * Guards `SplineFlow` against a scene that never loads (404, dropped
 * connection, a bad published URL). `<Spline>` has no error callback to
 * hook (checked its typings — `onLoad` is the only load-lifecycle prop),
 * so a hung load looks identical to a slow one from the outside. The
 * watchdog gives it `SPLINE_LOAD_TIMEOUT_MS` and then commits to `TwoDFlow`
 * — the visitor still gets a working site instead of a permanently blank
 * canvas. See `useSceneLoadWatchdog` for why the fallback is one-way.
 */
export function SplineFlowGate({ sceneUrl }: { sceneUrl: string }) {
  const { timedOut, markLoaded } = useSceneLoadWatchdog();

  if (timedOut) {
    return <TwoDFlow />;
  }
  return <SplineFlow sceneUrl={sceneUrl} onSceneLoaded={markLoaded} />;
}

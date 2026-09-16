'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SPLINE_LOAD_TIMEOUT_MS } from '@/lib/scene-phase';

export interface SceneLoadWatchdog {
  /** True once SPLINE_LOAD_TIMEOUT_MS has elapsed with no `markLoaded` call. */
  timedOut: boolean;
  /** Call from the scene's `onLoad`. A no-op once `timedOut` is already true. */
  markLoaded: () => void;
}

/**
 * A one-shot, one-way timer: it gives the Spline scene `SPLINE_LOAD_TIMEOUT_MS`
 * to call `markLoaded` (wired to `<Spline>`'s `onLoad`) before flipping
 * `timedOut` to true. There is no path back from `timedOut` — once the
 * caller (`SplineFlowGate`) decides to fall back to the 2D flow, it commits.
 * If the scene finishes loading after that point, `markLoaded` still runs
 * (harmless) but the fallback is not undone: an inconsistent scene that
 * loads sometimes and sometimes doesn't should behave predictably, not
 * flicker between two entirely different UIs.
 */
export function useSceneLoadWatchdog(): SceneLoadWatchdog {
  const [timedOut, setTimedOut] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loadedRef.current) {
        setTimedOut(true);
      }
    }, SPLINE_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeoutId);
  }, []);

  const markLoaded = useCallback(() => {
    loadedRef.current = true;
  }, []);

  return { timedOut, markLoaded };
}

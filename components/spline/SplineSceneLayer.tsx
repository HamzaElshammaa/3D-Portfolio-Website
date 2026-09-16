'use client';

import Spline from '@splinetool/react-spline';
import type { SplineEvent } from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';
import type { ThemeId } from '@/lib/theme-context';
import { THEMES, THEME_IDS } from '@/lib/theme-context';

const OBJECT_NAME_TO_THEME: Record<string, ThemeId> = Object.fromEntries(
  THEME_IDS.map((id) => [THEMES[id].splineObjectName, id])
);

/**
 * The persistent bottom layer of the Spline flow. This component is
 * mounted exactly once for the whole session (see `SplineFlow`) — never
 * keyed off the active theme or the current phase — because the zoom-out
 * has to replay the same live `Application` instance's authored
 * `MouseDown` transition in reverse. A remount would force the runtime to
 * reload the scene from scratch, snapping back to its default state with
 * no fullscreen card to reverse out of.
 */
export function SplineSceneLayer({
  sceneUrl,
  interactive,
  onLoad,
  onCardMouseDown,
}: {
  sceneUrl: string;
  /** Whether the scene should currently receive pointer events. Once the
   * site is up, clicks must pass through to it, not the canvas underneath. */
  interactive: boolean;
  onLoad: (app: Application) => void;
  onCardMouseDown: (themeId: ThemeId) => void;
}) {
  function handleMouseDown(e: SplineEvent) {
    const theme = OBJECT_NAME_TO_THEME[e.target.name];
    if (theme) {
      onCardMouseDown(theme);
    }
  }

  return (
    <div
      className="fixed inset-0 z-0 h-screen w-full"
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      aria-hidden={!interactive}
    >
      <Spline scene={sceneUrl} onLoad={onLoad} onSplineMouseDown={handleMouseDown} />
    </div>
  );
}

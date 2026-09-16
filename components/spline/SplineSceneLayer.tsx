'use client';

import Spline from '@splinetool/react-spline';
import type { SplineEvent } from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';
import type { ThemeId } from '@/lib/theme-context';
import { THEMES, THEME_IDS } from '@/lib/theme-context';

/**
 * Maps a clicked Spline object's name to the theme it selects. Built from
 * `THEMES[id].splineObjectName` (e.g. `Card_Apple`) plus that same name
 * with `Card_` swapped for `Group_` (e.g. `Group_Apple`) — the group each
 * card mesh lives inside, per the scene inspection in the integration
 * brief. `MouseDown` is authored on the card mesh, not the group, so the
 * group alias shouldn't normally be hit; it's cheap insurance against
 * Spline attributing a click to the parent instead, which — unguarded —
 * would silently do nothing.
 */
const OBJECT_NAME_TO_THEME: Record<string, ThemeId> = Object.fromEntries(
  THEME_IDS.flatMap((id) => {
    const cardName = THEMES[id].splineObjectName;
    const groupName = cardName.replace(/^Card_/, 'Group_');
    return [
      [cardName, id],
      [groupName, id],
    ];
  })
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
    } else if (process.env.NODE_ENV !== 'production') {
      // Silent misses here are a dead feature, not just a missed click —
      // this is the only signal we'd get if the real scene names a
      // clickable object something this map doesn't expect.
      console.warn(`SplineSceneLayer: MouseDown on unmapped Spline object "${e.target.name}"`);
    }
  }

  return (
    <div
      className="fixed inset-0 z-0"
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      aria-hidden={!interactive}
    >
      <Spline scene={sceneUrl} onLoad={onLoad} onSplineMouseDown={handleMouseDown} />
    </div>
  );
}

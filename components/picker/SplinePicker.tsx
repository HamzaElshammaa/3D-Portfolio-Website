'use client';

import Spline from '@splinetool/react-spline';
import type { SplineEvent } from '@splinetool/react-spline';
import type { ThemeId } from '@/lib/theme-context';

const OBJECT_NAME_TO_THEME: Record<string, ThemeId> = {
  Card_Apple: 'apple',
  Card_Brutalist: 'brutalist',
  Card_Terminal: 'terminal',
};

export function SplinePicker({
  sceneUrl,
  onSelectTheme,
}: {
  sceneUrl: string;
  onSelectTheme: (id: ThemeId) => void;
}) {
  function handleSplineMouseDown(e: SplineEvent) {
    const theme = OBJECT_NAME_TO_THEME[e.target.name];
    if (theme) {
      onSelectTheme(theme);
    }
  }

  return (
    <div className="relative h-screen w-full">
      <Spline scene={sceneUrl} onSplineMouseDown={handleSplineMouseDown} />
    </div>
  );
}

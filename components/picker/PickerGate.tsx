'use client';

import type { ThemeId } from '@/lib/theme-context';
import { choosePickerVariant, useWebGLSupported, usePrefersReducedMotion } from '@/lib/device-support';
import { SplinePicker } from './SplinePicker';
import { CardPicker2D } from './CardPicker2D';

export function PickerGate({ onSelectTheme }: { onSelectTheme: (id: ThemeId) => void }) {
  const hasWebGL = useWebGLSupported();
  const prefersReducedMotion = usePrefersReducedMotion();
  const sceneUrl = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL ?? '';

  const variant = choosePickerVariant({
    hasWebGL,
    prefersReducedMotion,
    hasSceneUrl: Boolean(sceneUrl),
  });

  if (variant === 'spline') {
    return <SplinePicker sceneUrl={sceneUrl} onSelectTheme={onSelectTheme} />;
  }
  return <CardPicker2D onSelectTheme={onSelectTheme} />;
}

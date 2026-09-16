'use client';

import { choosePickerVariant, useWebGLSupported, usePrefersReducedMotion } from '@/lib/device-support';
import { TwoDFlow } from './TwoDFlow';
import { SplineFlowGate } from './spline/SplineFlowGate';

/**
 * Top-level split between the two picker/site architectures. The decision
 * of *which* variant to use is entirely `choosePickerVariant`'s (untouched,
 * well-tested) — this component only reads the device signals it needs and
 * mounts the matching flow. `SplineFlowGate` and `TwoDFlow` are otherwise
 * independent: the Spline path keeps a persistent 3D layer alive under a
 * phase machine (falling back to `TwoDFlow` itself if the scene never
 * loads — see `SplineFlowGate`), the 2D flow instantly cross-fades between
 * two component trees the way this app always has.
 */
export function ThemeRenderer() {
  const hasWebGL = useWebGLSupported();
  const prefersReducedMotion = usePrefersReducedMotion();
  const sceneUrl = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL ?? '';

  const variant = choosePickerVariant({
    hasWebGL,
    prefersReducedMotion,
    hasSceneUrl: Boolean(sceneUrl),
  });

  if (variant === 'spline') {
    return <SplineFlowGate sceneUrl={sceneUrl} />;
  }
  return <TwoDFlow />;
}

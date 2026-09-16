import { describe, it, expect } from 'vitest';
import { choosePickerVariant } from './device-support';

describe('choosePickerVariant', () => {
  it('uses spline when webgl is supported, motion is fine, and a scene url exists', () => {
    expect(
      choosePickerVariant({ hasWebGL: true, prefersReducedMotion: false, hasSceneUrl: true })
    ).toBe('spline');
  });

  it('falls back to 2d when webgl is unsupported', () => {
    expect(
      choosePickerVariant({ hasWebGL: false, prefersReducedMotion: false, hasSceneUrl: true })
    ).toBe('2d');
  });

  it('falls back to 2d when the visitor prefers reduced motion', () => {
    expect(
      choosePickerVariant({ hasWebGL: true, prefersReducedMotion: true, hasSceneUrl: true })
    ).toBe('2d');
  });

  it('falls back to 2d when no scene url is configured', () => {
    expect(
      choosePickerVariant({ hasWebGL: true, prefersReducedMotion: false, hasSceneUrl: false })
    ).toBe('2d');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/device-support', async () => {
  const actual = await vi.importActual<typeof import('@/lib/device-support')>('@/lib/device-support');
  return {
    ...actual,
    useWebGLSupported: vi.fn(),
    usePrefersReducedMotion: vi.fn(),
  };
});
vi.mock('./spline/SplineFlowGate', () => ({
  SplineFlowGate: () => <div data-testid="spline-flow" />,
}));
vi.mock('./TwoDFlow', () => ({
  TwoDFlow: () => <div data-testid="2d-flow" />,
}));

import { useWebGLSupported, usePrefersReducedMotion } from '@/lib/device-support';
import { ThemeRenderer } from './ThemeRenderer';

// This mirrors what PickerGate.test.tsx used to cover: the decision of
// which flow to mount is `choosePickerVariant`'s (real, unmocked here) —
// only the two device-signal hooks are stubbed.
describe('ThemeRenderer', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SPLINE_SCENE_URL', 'https://example.com/scene.splinecode');
  });

  it('renders the Spline flow when webgl is supported and motion is fine', () => {
    vi.mocked(useWebGLSupported).mockReturnValue(true);
    vi.mocked(usePrefersReducedMotion).mockReturnValue(false);
    render(<ThemeRenderer />);
    expect(screen.getByTestId('spline-flow')).toBeInTheDocument();
  });

  it('renders the 2D flow when webgl is unsupported', () => {
    vi.mocked(useWebGLSupported).mockReturnValue(false);
    vi.mocked(usePrefersReducedMotion).mockReturnValue(false);
    render(<ThemeRenderer />);
    expect(screen.getByTestId('2d-flow')).toBeInTheDocument();
  });

  it('renders the 2D flow when no Spline scene url is configured, even with webgl support', () => {
    vi.stubEnv('NEXT_PUBLIC_SPLINE_SCENE_URL', '');
    vi.mocked(useWebGLSupported).mockReturnValue(true);
    vi.mocked(usePrefersReducedMotion).mockReturnValue(false);
    render(<ThemeRenderer />);
    expect(screen.getByTestId('2d-flow')).toBeInTheDocument();
  });

  it('renders the 2D flow when motion is reduced, even with webgl support and a scene url', () => {
    vi.mocked(useWebGLSupported).mockReturnValue(true);
    vi.mocked(usePrefersReducedMotion).mockReturnValue(true);
    render(<ThemeRenderer />);
    expect(screen.getByTestId('2d-flow')).toBeInTheDocument();
  });
});

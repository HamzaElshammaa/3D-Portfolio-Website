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
vi.mock('./SplinePicker', () => ({
  SplinePicker: () => <div data-testid="spline-picker" />,
}));
vi.mock('./CardPicker2D', () => ({
  CardPicker2D: () => <div data-testid="2d-picker" />,
}));

import { useWebGLSupported, usePrefersReducedMotion } from '@/lib/device-support';
import { PickerGate } from './PickerGate';

describe('PickerGate', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SPLINE_SCENE_URL', 'https://example.com/scene.splinecode');
  });

  it('renders the Spline picker when webgl is supported and motion is fine', () => {
    vi.mocked(useWebGLSupported).mockReturnValue(true);
    vi.mocked(usePrefersReducedMotion).mockReturnValue(false);
    render(<PickerGate onSelectTheme={() => {}} />);
    expect(screen.getByTestId('spline-picker')).toBeInTheDocument();
  });

  it('renders the 2D picker when webgl is unsupported', () => {
    vi.mocked(useWebGLSupported).mockReturnValue(false);
    vi.mocked(usePrefersReducedMotion).mockReturnValue(false);
    render(<PickerGate onSelectTheme={() => {}} />);
    expect(screen.getByTestId('2d-picker')).toBeInTheDocument();
  });
});

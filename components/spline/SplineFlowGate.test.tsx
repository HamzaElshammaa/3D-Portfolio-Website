import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';

vi.mock('./SplineFlow', () => ({
  SplineFlow: ({ onSceneLoaded }: { onSceneLoaded?: () => void }) => (
    <div data-testid="spline-flow">
      <button onClick={() => onSceneLoaded?.()}>simulate load</button>
    </div>
  ),
}));
vi.mock('../TwoDFlow', () => ({
  TwoDFlow: () => <div data-testid="2d-flow" />,
}));

import { SPLINE_LOAD_TIMEOUT_MS } from '@/lib/scene-phase';
import { SplineFlowGate } from './SplineFlowGate';

describe('SplineFlowGate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders SplineFlow immediately, before the load timeout', () => {
    render(<SplineFlowGate sceneUrl="https://example.com/scene.splinecode" />);
    expect(screen.getByTestId('spline-flow')).toBeInTheDocument();
    expect(screen.queryByTestId('2d-flow')).not.toBeInTheDocument();
  });

  it('falls back to TwoDFlow once the load timeout elapses without a load', () => {
    render(<SplineFlowGate sceneUrl="https://example.com/scene.splinecode" />);

    act(() => {
      vi.advanceTimersByTime(SPLINE_LOAD_TIMEOUT_MS);
    });

    expect(screen.getByTestId('2d-flow')).toBeInTheDocument();
    expect(screen.queryByTestId('spline-flow')).not.toBeInTheDocument();
  });

  it('does not fall back if the scene loads before the timeout', () => {
    render(<SplineFlowGate sceneUrl="https://example.com/scene.splinecode" />);

    act(() => {
      vi.advanceTimersByTime(SPLINE_LOAD_TIMEOUT_MS - 1000);
    });
    act(() => {
      screen.getByText('simulate load').click();
    });
    act(() => {
      vi.advanceTimersByTime(5000); // well past the original deadline
    });

    expect(screen.getByTestId('spline-flow')).toBeInTheDocument();
    expect(screen.queryByTestId('2d-flow')).not.toBeInTheDocument();
  });

  it('does not switch back once it has already fallen back, even if time keeps passing', () => {
    render(<SplineFlowGate sceneUrl="https://example.com/scene.splinecode" />);

    act(() => {
      vi.advanceTimersByTime(SPLINE_LOAD_TIMEOUT_MS);
    });
    expect(screen.getByTestId('2d-flow')).toBeInTheDocument();

    // SplineFlow (and its "simulate load" button) is unmounted at this
    // point, so there is no way left to fire onSceneLoaded — which is the
    // point: the fallback is final, not something a late load can undo.
    act(() => {
      vi.advanceTimersByTime(SPLINE_LOAD_TIMEOUT_MS);
    });
    expect(screen.getByTestId('2d-flow')).toBeInTheDocument();
    expect(screen.queryByTestId('spline-flow')).not.toBeInTheDocument();
  });
});

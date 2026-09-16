import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

// Mirrors the mocking style of the old SplinePicker.test.tsx: the real
// `@splinetool/react-spline` needs a WebGL canvas jsdom cannot provide, so
// it's replaced with a stand-in that (a) records how many times it mounts
// (proving the Spline layer persists rather than reloading), (b) calls
// `onLoad` once with a fake `Application` whose `emitEventReverse` we can
// assert on, and (c) fires `onSplineMouseDown` for a card on mousedown.
const hoisted = vi.hoisted(() => ({
  emitEventReverse: vi.fn(),
  mountCount: { current: 0 },
}));

vi.mock('@splinetool/react-spline', async () => {
  const React = await import('react');
  function MockSpline({
    onLoad,
    onSplineMouseDown,
  }: {
    onLoad?: (app: { emitEventReverse: typeof hoisted.emitEventReverse }) => void;
    onSplineMouseDown?: (e: { target: { name: string } }) => void;
  }) {
    React.useEffect(() => {
      hoisted.mountCount.current += 1;
      onLoad?.({ emitEventReverse: hoisted.emitEventReverse });
      // Mount/load semantics only — deliberately not re-running per prop change.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <div
        data-testid="mock-spline"
        onMouseDown={() => onSplineMouseDown?.({ target: { name: 'Card_Apple' } })}
      />
    );
  }
  return { default: MockSpline };
});

import { ThemeProvider, useTheme } from '@/lib/theme-context';
import { SPLINE_ZOOM_MS, BLACK_FADE_MS } from '@/lib/scene-phase';
import { SplineFlow } from './SplineFlow';

// Exposes the real ThemeContext's activeTheme so tests can assert it stays
// in sync with the phase machine, instead of the machine keeping a second,
// silently-diverging copy.
function ActiveThemeProbe() {
  const { activeTheme } = useTheme();
  return <span data-testid="context-active-theme">{activeTheme ?? 'none'}</span>;
}

function renderFlow() {
  return render(
    <ThemeProvider>
      <ActiveThemeProbe />
      <SplineFlow sceneUrl="https://example.com/scene.splinecode" />
    </ThemeProvider>
  );
}

function clickCard() {
  fireEvent.mouseDown(screen.getByTestId('mock-spline'));
}

function clickSwitcher() {
  fireEvent.click(screen.getByRole('button', { name: /switch design/i }));
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('SplineFlow phase machine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    hoisted.mountCount.current = 0;
    hoisted.emitEventReverse.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not render the site while zooming in, but does once the zoom finishes', () => {
    renderFlow();

    expect(screen.getByTestId('mock-spline')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();

    act(() => {
      clickCard();
    });
    // Mid-zoom: Spline is playing its own 800ms tween. The site must not
    // appear yet.
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /switch design/i })).not.toBeInTheDocument();

    advance(SPLINE_ZOOM_MS);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch design/i })).toBeInTheDocument();
  });

  it('keeps the Spline layer mounted exactly once across a full in-and-out cycle', () => {
    renderFlow();
    expect(hoisted.mountCount.current).toBe(1);

    act(() => {
      clickCard();
    });
    advance(SPLINE_ZOOM_MS);
    expect(hoisted.mountCount.current).toBe(1);

    act(() => {
      clickSwitcher();
    });
    advance(BLACK_FADE_MS);
    expect(hoisted.mountCount.current).toBe(1);

    advance(SPLINE_ZOOM_MS);
    expect(hoisted.mountCount.current).toBe(1);

    // Back at `scene` — pick again to prove the cycle actually repeats.
    act(() => {
      clickCard();
    });
    advance(SPLINE_ZOOM_MS);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(hoisted.mountCount.current).toBe(1);
  });

  it('unmounts the site before playing the reverse zoom, with the correct object name', () => {
    renderFlow();

    act(() => {
      clickCard();
    });
    advance(SPLINE_ZOOM_MS);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    act(() => {
      clickSwitcher();
    });
    // Still fading the overlay in — site (and the reverse call) shouldn't
    // have gone anywhere yet.
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(hoisted.emitEventReverse).not.toHaveBeenCalled();

    advance(BLACK_FADE_MS);

    // The site must be gone by the time the reverse tween is fired.
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(hoisted.emitEventReverse).toHaveBeenCalledTimes(1);
    expect(hoisted.emitEventReverse).toHaveBeenCalledWith('mouseDown', 'Card_Apple');
  });

  it('does not let the switcher trigger a second reverse zoom mid-transition', () => {
    renderFlow();

    act(() => {
      clickCard();
    });
    advance(SPLINE_ZOOM_MS);
    act(() => {
      clickSwitcher();
    });

    // The switcher is site chrome; once the site is gone (fadingOut ->
    // zoomingOut) there is nothing left to click.
    expect(screen.queryByRole('button', { name: /switch design/i })).not.toBeInTheDocument();

    advance(BLACK_FADE_MS + SPLINE_ZOOM_MS);
    expect(hoisted.emitEventReverse).toHaveBeenCalledTimes(1);
  });

  it('drives the real ThemeContext.activeTheme instead of keeping a second, silent copy', () => {
    renderFlow();
    expect(screen.getByTestId('context-active-theme')).toHaveTextContent('none');

    act(() => {
      clickCard();
    });
    // Selected the instant the card is clicked, not only once the zoom finishes.
    expect(screen.getByTestId('context-active-theme')).toHaveTextContent('apple');

    advance(SPLINE_ZOOM_MS);
    expect(screen.getByTestId('context-active-theme')).toHaveTextContent('apple');

    act(() => {
      clickSwitcher();
    });
    advance(BLACK_FADE_MS);
    // Reverse zoom is playing; context still reports the outgoing theme
    // until the machine has fully returned to `scene`.
    expect(screen.getByTestId('context-active-theme')).toHaveTextContent('apple');

    advance(SPLINE_ZOOM_MS);
    expect(screen.getByTestId('context-active-theme')).toHaveTextContent('none');
  });
});

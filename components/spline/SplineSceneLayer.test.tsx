import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';

const hoisted = vi.hoisted(() => ({
  capturedHandler: { current: null as null | ((e: { target: { name: string } }) => void) },
}));

vi.mock('@splinetool/react-spline', () => ({
  default: ({ onSplineMouseDown }: { onSplineMouseDown: (e: { target: { name: string } }) => void }) => {
    hoisted.capturedHandler.current = onSplineMouseDown;
    return <div data-testid="mock-spline" />;
  },
}));

import { SplineSceneLayer } from './SplineSceneLayer';

describe('SplineSceneLayer', () => {
  const onCardMouseDown = vi.fn();
  const onLoad = vi.fn();

  beforeEach(() => {
    onCardMouseDown.mockClear();
    onLoad.mockClear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderLayer(interactive = true) {
    return render(
      <SplineSceneLayer
        sceneUrl="https://example.com/scene.splinecode"
        interactive={interactive}
        onLoad={onLoad}
        onCardMouseDown={onCardMouseDown}
      />
    );
  }

  it('maps a card mesh name to its theme', () => {
    renderLayer();
    hoisted.capturedHandler.current?.({ target: { name: 'Card_Apple' } });
    expect(onCardMouseDown).toHaveBeenCalledWith('apple');
  });

  it('also accepts the parent group name as an alias, in case Spline attributes the click there', () => {
    renderLayer();
    hoisted.capturedHandler.current?.({ target: { name: 'Group_Retro' } });
    expect(onCardMouseDown).toHaveBeenCalledWith('retro');

    hoisted.capturedHandler.current?.({ target: { name: 'Group_Terminal' } });
    expect(onCardMouseDown).toHaveBeenCalledWith('terminal');
  });

  it('warns and does not call onCardMouseDown when the object name matches nothing', () => {
    renderLayer();
    hoisted.capturedHandler.current?.({ target: { name: 'Some_Other_Mesh' } });
    expect(onCardMouseDown).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Some_Other_Mesh'));
  });

  it('sets pointer-events to auto when interactive and none when not', () => {
    const { container, rerender } = renderLayer(true);
    expect((container.firstChild as HTMLElement).style.pointerEvents).toBe('auto');

    rerender(
      <SplineSceneLayer
        sceneUrl="https://example.com/scene.splinecode"
        interactive={false}
        onLoad={onLoad}
        onCardMouseDown={onCardMouseDown}
      />
    );
    expect((container.firstChild as HTMLElement).style.pointerEvents).toBe('none');
  });
});

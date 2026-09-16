import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@splinetool/react-spline', () => ({
  default: ({ onSplineMouseDown }: { onSplineMouseDown: (e: { target: { name: string } }) => void }) => (
    <div
      data-testid="mock-spline"
      onMouseDown={() => onSplineMouseDown({ target: { name: 'Card_Brutalist' } })}
    />
  ),
}));

import { SplinePicker } from './SplinePicker';

describe('SplinePicker', () => {
  it('maps a clicked Spline object name to the matching theme id', async () => {
    const user = userEvent.setup();
    const onSelectTheme = vi.fn();
    render(<SplinePicker sceneUrl="https://example.com/scene.splinecode" onSelectTheme={onSelectTheme} />);
    await user.click(screen.getByTestId('mock-spline'));
    expect(onSelectTheme).toHaveBeenCalledWith('brutalist');
  });
});

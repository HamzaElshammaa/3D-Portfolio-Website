import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardPicker2D } from './CardPicker2D';

describe('CardPicker2D', () => {
  it('renders three cards for apple, retro, and terminal', () => {
    render(<CardPicker2D onSelectTheme={() => {}} />);
    expect(screen.getByText(/apple/i)).toBeInTheDocument();
    expect(screen.getByText(/retro/i)).toBeInTheDocument();
    expect(screen.getByText(/terminal/i)).toBeInTheDocument();
  });

  it('calls onSelectTheme with the correct id when a card is clicked', async () => {
    const user = userEvent.setup();
    const onSelectTheme = vi.fn();
    render(<CardPicker2D onSelectTheme={onSelectTheme} />);
    await user.click(screen.getByTestId('card-retro'));
    expect(onSelectTheme).toHaveBeenCalledWith('retro');
  });
});

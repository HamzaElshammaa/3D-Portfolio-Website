import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const reopenPicker = vi.fn();
vi.mock('@/lib/theme-context', () => ({
  useTheme: () => ({ activeTheme: 'apple', selectTheme: vi.fn(), reopenPicker }),
}));

import { FloatingSwitcher } from './FloatingSwitcher';

describe('FloatingSwitcher', () => {
  it('calls reopenPicker when clicked', async () => {
    const user = userEvent.setup();
    render(<FloatingSwitcher />);
    await user.click(screen.getByRole('button', { name: /switch design/i }));
    expect(reopenPicker).toHaveBeenCalled();
  });
});

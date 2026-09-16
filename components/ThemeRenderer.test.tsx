import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('./picker/PickerGate', () => ({
  PickerGate: ({ onSelectTheme }: { onSelectTheme: (id: string) => void }) => (
    <button onClick={() => onSelectTheme('apple')}>pick apple</button>
  ),
}));
vi.mock('@/themes/registry', () => ({
  themeRegistry: {
    apple: () => <div data-testid="apple-theme" />,
    brutalist: () => <div data-testid="brutalist-theme" />,
    terminal: () => <div data-testid="terminal-theme" />,
  },
}));

import { ThemeProvider } from '@/lib/theme-context';
import { ThemeRenderer } from './ThemeRenderer';

describe('ThemeRenderer', () => {
  it('shows the picker before a theme is chosen', () => {
    render(
      <ThemeProvider>
        <ThemeRenderer />
      </ThemeProvider>
    );
    expect(screen.getByText('pick apple')).toBeInTheDocument();
  });

  it('renders the selected theme after picking a card', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeRenderer />
      </ThemeProvider>
    );
    await user.click(screen.getByText('pick apple'));
    expect(await screen.findByTestId('apple-theme')).toBeInTheDocument();
  });
});

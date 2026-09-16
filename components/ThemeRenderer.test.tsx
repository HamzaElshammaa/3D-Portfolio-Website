import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('./picker/PickerGate', () => ({
  PickerGate: ({ onSelectTheme }: { onSelectTheme: (id: string) => void }) => (
    <div>
      <button onClick={() => onSelectTheme('apple')}>pick apple</button>
      <button onClick={() => onSelectTheme('retro')}>pick retro</button>
    </div>
  ),
}));
vi.mock('@/themes/registry', () => ({
  themeRegistry: {
    apple: () => <div data-testid="apple-theme" />,
    retro: () => <div data-testid="retro-theme" />,
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

  it('does not show the switcher over the picker', () => {
    render(
      <ThemeProvider>
        <ThemeRenderer />
      </ThemeProvider>
    );
    expect(screen.queryByRole('button', { name: /switch design/i })).not.toBeInTheDocument();
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

  it('renders the floating switcher for a real theme (apple)', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeRenderer />
      </ThemeProvider>
    );
    await user.click(screen.getByText('pick apple'));
    await screen.findByTestId('apple-theme');
    expect(screen.getByRole('button', { name: /switch design/i })).toBeInTheDocument();
  });

  it('renders the floating switcher for a placeholder theme too (not just apple)', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeRenderer />
      </ThemeProvider>
    );
    await user.click(screen.getByText('pick retro'));
    await screen.findByTestId('retro-theme');
    expect(screen.getByRole('button', { name: /switch design/i })).toBeInTheDocument();
  });

  it('removes the outgoing view from the document instead of leaving it mounted', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeRenderer />
      </ThemeProvider>
    );

    await user.click(screen.getByText('pick apple'));
    await screen.findByTestId('apple-theme');

    await user.click(screen.getByRole('button', { name: /switch design/i }));
    await screen.findByText('pick retro');
    // The apple view must be gone, not just hidden — a lingering
    // opacity:0 copy would still be focusable and exposed to assistive
    // technology, and would accumulate on every switch.
    expect(screen.queryByTestId('apple-theme')).not.toBeInTheDocument();

    await user.click(screen.getByText('pick retro'));
    await screen.findByTestId('retro-theme');
    expect(screen.queryByText('pick apple')).not.toBeInTheDocument();
    expect(screen.queryByText('pick retro')).not.toBeInTheDocument();
    expect(screen.queryByTestId('apple-theme')).not.toBeInTheDocument();
  });
});

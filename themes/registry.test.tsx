import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/theme-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/theme-context')>();
  return {
    ...actual,
    useTheme: () => ({ activeTheme: 'apple', selectTheme: vi.fn(), reopenPicker: vi.fn() }),
  };
});

import { themeRegistry } from './registry';
import { content } from '@/content/site-content';

describe('themeRegistry', () => {
  it('has an entry for apple, retro, and terminal', () => {
    expect(themeRegistry.apple).toBeDefined();
    expect(themeRegistry.retro).toBeDefined();
    expect(themeRegistry.terminal).toBeDefined();
  });

  it('renders the real Apple theme for "apple"', () => {
    const AppleEntry = themeRegistry.apple;
    render(<AppleEntry />);
    expect(screen.getByRole('heading', { name: content.hero.headline })).toBeInTheDocument();
  });

  it('renders a coming-soon placeholder for "retro"', () => {
    const RetroEntry = themeRegistry.retro;
    render(<RetroEntry />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it('renders a coming-soon placeholder for "terminal"', () => {
    const TerminalEntry = themeRegistry.terminal;
    render(<TerminalEntry />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});

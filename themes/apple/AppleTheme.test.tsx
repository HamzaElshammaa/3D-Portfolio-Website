import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/theme-context', () => ({
  useTheme: () => ({ activeTheme: 'apple', selectTheme: vi.fn(), reopenPicker: vi.fn() }),
}));

import { AppleTheme } from './AppleTheme';
import { content } from '@/content/site-content';

describe('AppleTheme', () => {
  it('renders the hero headline and at least one project name', () => {
    render(<AppleTheme />);
    expect(screen.getByRole('heading', { name: content.hero.headline })).toBeInTheDocument();
    expect(screen.getByText(content.projects[0].name)).toBeInTheDocument();
  });
});

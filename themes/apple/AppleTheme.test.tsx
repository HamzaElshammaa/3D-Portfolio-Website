import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AppleTheme } from './AppleTheme';
import { content } from '@/content/site-content';

describe('AppleTheme', () => {
  it('renders the hero headline and at least one project name', () => {
    render(<AppleTheme />);
    expect(screen.getByRole('heading', { name: content.hero.headline })).toBeInTheDocument();
    expect(screen.getByText(content.projects[0].name)).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AppleTheme } from './AppleTheme';
import { content } from '@/content/site-content';
import { expectThemeRendersItsSections } from '../themeStructureAssertions';

describe('AppleTheme', () => {
  it('renders the hero headline and at least one project name', () => {
    render(<AppleTheme />);
    expect(screen.getByRole('heading', { name: content.hero.headline })).toBeInTheDocument();
    expect(screen.getByText(content.projects[0].name)).toBeInTheDocument();
  });

  it('renders every section: each nav anchor id exists and Testimonials renders', () => {
    expectThemeRendersItsSections(AppleTheme, {
      anchorIds: content.nav.map((link) => link.href.replace('#', '')),
      sectionTexts: [
        content.hero.headline,
        content.workHeading,
        content.about.narrative,
        content.servicesHeading,
        content.testimonials[0].quote,
      ],
    });
  });
});

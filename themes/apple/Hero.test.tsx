import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppleHero } from './Hero';

const hero = {
  headline: 'Test headline',
  subhead: 'Test subhead',
  primaryCtaLabel: 'View Work',
  secondaryCtaLabel: 'Get in touch',
};

describe('AppleHero', () => {
  it('renders headline, subhead, and both CTAs', () => {
    render(<AppleHero hero={hero} />);
    expect(screen.getByRole('heading', { name: 'Test headline' })).toBeInTheDocument();
    expect(screen.getByText('Test subhead')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Work' })).toHaveAttribute('href', '#work');
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '#contact');
  });
});

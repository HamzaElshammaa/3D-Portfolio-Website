import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppleNav, AppleFooter } from './NavFooter';

describe('AppleNav', () => {
  it('renders anchor links to each section', () => {
    render(<AppleNav />);
    expect(screen.getByRole('link', { name: /work/i })).toHaveAttribute('href', '#work');
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: /services/i })).toHaveAttribute('href', '#services');
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '#contact');
  });
});

describe('AppleFooter', () => {
  it('renders each provided social link', () => {
    render(<AppleFooter socials={[{ label: 'GitHub', url: 'https://github.com/example' }]} />);
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/example');
  });
});

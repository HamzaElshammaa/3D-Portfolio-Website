import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppleNav, AppleFooter } from './NavFooter';

const links = [
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' },
];

describe('AppleNav', () => {
  it('renders the wordmark and anchor links to each section', () => {
    render(<AppleNav wordmark="Portfolio" links={links} />);
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /work/i })).toHaveAttribute('href', '#work');
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: /services/i })).toHaveAttribute('href', '#services');
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '#contact');
  });
});

describe('AppleFooter', () => {
  it('renders each provided social link, opening in a new tab, and the copyright notice', () => {
    render(
      <AppleFooter
        socials={[{ label: 'GitHub', url: 'https://github.com/example' }]}
        copyrightNotice="All rights reserved."
      />
    );
    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com/example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppleAboutServices } from './AboutServices';

const about = { narrative: 'I ship polished products fast.', skills: ['React', 'Next.js'] };
const services = [{ title: 'Landing Pages', description: 'Fast marketing sites.' }];

describe('AppleAboutServices', () => {
  it('renders the narrative, skills, and services', () => {
    render(<AppleAboutServices about={about} services={services} />);
    expect(screen.getByText(about.narrative)).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Landing Pages')).toBeInTheDocument();
    expect(screen.getByText('Fast marketing sites.')).toBeInTheDocument();
  });
});

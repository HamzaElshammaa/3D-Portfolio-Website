import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppleWork } from './Work';
import type { Project } from '@/content/site-content';

const projects: Project[] = [
  {
    id: 'p1',
    name: 'Project One',
    description: 'Desc one',
    techStack: ['Next.js'],
    liveUrl: 'https://example.com/one',
    kind: 'web',
    imageUrl: '/one.png',
  },
  {
    id: 'p2',
    name: 'Project Two',
    description: 'Desc two',
    techStack: ['React Native'],
    liveUrl: 'https://example.com/two',
    kind: 'mobile',
    imageUrl: '/two.png',
  },
];

describe('AppleWork', () => {
  it('renders one card per project with a link to its live url', () => {
    render(<AppleWork projects={projects} />);
    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /project one/i })).toHaveAttribute(
      'href',
      'https://example.com/one'
    );
  });
});

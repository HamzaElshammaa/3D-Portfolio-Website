import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
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
  it('renders the section heading and one card per project, each linking to its live url in a new tab', () => {
    render(<AppleWork projects={projects} heading="Selected Work" />);
    expect(screen.getByRole('heading', { name: 'Selected Work' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(projects.length);
    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /project one/i });
    expect(link).toHaveAttribute('href', 'https://example.com/one');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('falls back to the grey placeholder when the project image fails to load', () => {
    const { container } = render(<AppleWork projects={projects} heading="Selected Work" />);
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(projects.length);
    const firstImage = images[0];
    act(() => {
      firstImage.dispatchEvent(new Event('error'));
    });
    expect(container.querySelectorAll('img').length).toBe(projects.length - 1);
  });
});

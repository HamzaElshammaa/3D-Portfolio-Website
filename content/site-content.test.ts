import { describe, it, expect } from 'vitest';
import { content } from './site-content';

describe('site content', () => {
  it('has between 3 and 5 projects, each with required fields', () => {
    expect(content.projects.length).toBeGreaterThanOrEqual(3);
    expect(content.projects.length).toBeLessThanOrEqual(5);
    for (const project of content.projects) {
      expect(project.name).toBeTruthy();
      expect(project.description).toBeTruthy();
      expect(project.techStack.length).toBeGreaterThan(0);
      expect(project.liveUrl).toBeTruthy();
      expect(['web', 'mobile']).toContain(project.kind);
    }
  });

  it('has hero, about, services, testimonials, and contact content', () => {
    expect(content.hero.headline).toBeTruthy();
    expect(content.hero.subhead).toBeTruthy();
    expect(content.about.narrative).toBeTruthy();
    expect(content.about.skills.length).toBeGreaterThan(0);
    expect(content.services.length).toBeGreaterThan(0);
    expect(content.testimonials.length).toBeGreaterThanOrEqual(2);
    expect(content.contact.email).toContain('@');
  });
});

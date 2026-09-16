export type ProjectKind = 'web' | 'mobile';

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  liveUrl: string;
  kind: ProjectKind;
  imageUrl: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface ServiceItem {
  title: string;
  description: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface SiteContent {
  site: {
    wordmark: string;
    copyrightNotice: string;
  };
  nav: NavLink[];
  hero: {
    headline: string;
    subhead: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
  projects: Project[];
  workHeading: string;
  about: {
    narrative: string;
    skills: string[];
  };
  servicesHeading: string;
  services: ServiceItem[];
  testimonials: Testimonial[];
  contact: {
    email: string;
    calendlyUrl: string;
    socials: { label: string; url: string }[];
  };
}

export const content: SiteContent = {
  site: {
    wordmark: 'Portfolio',
    copyrightNotice: 'All rights reserved.',
  },
  nav: [
    { href: '#work', label: 'Work' },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#contact', label: 'Contact' },
  ],
  hero: {
    headline: 'I build fast, polished web and mobile products.',
    subhead:
      'Freelance frontend developer helping startups and small teams ship interfaces that feel as good as they look.',
    primaryCtaLabel: 'View Work',
    secondaryCtaLabel: 'Get in touch',
  },
  projects: [
    {
      id: 'project-one',
      name: 'Project One',
      description: 'Placeholder project — replace with a real case study.',
      techStack: ['Next.js', 'TypeScript', 'Tailwind'],
      liveUrl: 'https://example.com',
      kind: 'web',
      imageUrl: '/projects/placeholder-1.png',
    },
    {
      id: 'project-two',
      name: 'Project Two',
      description: 'Placeholder project — replace with a real case study.',
      techStack: ['React Native', 'TypeScript'],
      liveUrl: 'https://example.com',
      kind: 'mobile',
      imageUrl: '/projects/placeholder-2.png',
    },
    {
      id: 'project-three',
      name: 'Project Three',
      description: 'Placeholder project — replace with a real case study.',
      techStack: ['React', 'Node.js'],
      liveUrl: 'https://example.com',
      kind: 'web',
      imageUrl: '/projects/placeholder-3.png',
    },
  ],
  workHeading: 'Selected Work',
  about: {
    narrative:
      'I help clients ship products faster without sacrificing polish — from first pixel to production deploy.',
    skills: ['React', 'Next.js', 'React Native', 'TypeScript', 'Tailwind CSS'],
  },
  servicesHeading: 'Services',
  services: [
    {
      title: 'Landing Pages',
      description: 'Conversion-focused marketing sites built to launch fast.',
    },
    {
      title: 'Web Applications',
      description: 'Full-featured product interfaces, from MVP to scale.',
    },
    {
      title: 'Mobile Apps',
      description: 'Cross-platform apps with React Native, shipped to both stores.',
    },
  ],
  testimonials: [
    {
      quote: 'Placeholder testimonial — replace with a real client quote.',
      name: 'Jane Doe',
      role: 'Founder, Example Co.',
    },
    {
      quote: 'Placeholder testimonial — replace with a real client quote.',
      name: 'John Smith',
      role: 'Product Lead, Example Inc.',
    },
  ],
  contact: {
    email: 'hamzahelshammaa@gmail.com',
    calendlyUrl: 'https://calendly.com/example',
    socials: [
      { label: 'GitHub', url: 'https://github.com/example' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/example' },
    ],
  },
};

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
    wordmark: 'Hamza El-Shammaa',
    copyrightNotice: '© 2026 Hamza El-Shammaa. All rights reserved.',
  },
  nav: [
    { href: '#work', label: 'Work' },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#contact', label: 'Contact' },
  ],
  hero: {
    headline: 'Precision-crafted web and mobile products for ambitious brands.',
    subhead:
      'Computer engineer and full-stack developer building fast, polished digital experiences from concept to production deploy.',
    primaryCtaLabel: 'View Work',
    secondaryCtaLabel: 'Get in touch',
  },
  projects: [
    {
      id: 'xsquare',
      name: 'Xsquare Feast Menu',
      description:
        'Interactive brand experience and digital menu for an artisanal food truck, designed for speed, fluid navigation, and visual appetite appeal.',
      techStack: ['Next.js', 'React', 'Tailwind CSS', 'Framer Motion'],
      liveUrl: 'https://github.com/HamzaElshammaa/xsquare-feast-menu',
      kind: 'web',
      imageUrl: '/projects/placeholder-1.png',
    },
    {
      id: 'hoopoe-digital',
      name: 'Hoopoe Digital',
      description:
        'Corporate web platform for spatial intelligence and smart WiFi, featuring interactive indoor map navigation, vulnerability mitigation, and billing integration.',
      techStack: ['React', 'JavaScript', 'CSS3', 'Payment Gateway'],
      liveUrl: 'https://www.hoopoe.digital/',
      kind: 'web',
      imageUrl: '/projects/placeholder-2.png',
    },
    {
      id: 'travelm8',
      name: 'TravelM8 Agency',
      description:
        'Feature-rich travel and tourism discovery platform with curated destination itineraries, tour filtering, and structured booking workflows.',
      techStack: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
      liveUrl: 'https://github.com/Advanced-computer-lab-2024/TravelM8',
      kind: 'web',
      imageUrl: '/projects/placeholder-3.png',
    },
    {
      id: 'talent-matching',
      name: 'AI Talent & Job Matching Platform',
      description:
        'Full-stack talent platform and cross-platform mobile app with custom dashboards, real-time WebSocket transport, and multi-provider LLM CV ingestion.',
      techStack: ['Next.js', 'NestJS', 'Expo (React Native)', 'Supabase', 'TypeScript'],
      liveUrl: 'https://github.com/HamzaElshammaa',
      kind: 'mobile',
      imageUrl: '/projects/placeholder-1.png',
    },
    {
      id: 'clinic-portal',
      name: 'Healthcare Clinic Portal',
      description:
        'Patient-centric medical clinic website with online appointment scheduling, doctor profiles, service catalogs, and mobile-optimized access.',
      techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
      liveUrl: 'https://github.com/HamzaElshammaa',
      kind: 'web',
      imageUrl: '/projects/placeholder-2.png',
    },
  ],
  workHeading: 'Selected Work',
  about: {
    narrative:
      'I help startups, agencies, and businesses ship fast, high-converting digital products. From consumer-facing web experiences to full-stack platforms and mobile apps, I focus on clean architecture, fluid interfaces, and production reliability.',
    skills: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'React Native (Expo)',
      'NestJS',
      'Node.js',
      'Supabase / PostgreSQL',
    ],
  },
  servicesHeading: 'Services',
  services: [
    {
      title: 'Custom Websites & Landing Pages',
      description:
        'High-converting, brand-driven marketing sites and digital menus with fluid animations and sub-second load times.',
    },
    {
      title: 'Full-Stack Web Applications',
      description:
        'End-to-end web platforms with complex dashboards, authentication, REST/WebSocket APIs, and database architecture.',
    },
    {
      title: 'Cross-Platform Mobile Apps',
      description:
        'Native-feeling mobile apps for iOS and Android built with Expo and React Native, from MVP to store release.',
    },
  ],
  testimonials: [
    {
      quote:
        'Hamza delivered a clean, high-performance website with meticulous attention to detail. Fast turnaround and effortless communication.',
      name: 'Agency Partner',
      role: 'Digital Director',
    },
    {
      quote:
        'From architecture to interface polish, everything felt intuitive, responsive, and rock-solid under real traffic.',
      name: 'Product Founder',
      role: 'Startup Lead',
    },
  ],
  contact: {
    email: 'hamzahelshammaa@gmail.com',
    calendlyUrl: 'https://calendly.com/hamzahelshammaa',
    socials: [
      { label: 'GitHub', url: 'https://github.com/HamzaElshammaa' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/hamzaelshammaa' },
    ],
  },
};

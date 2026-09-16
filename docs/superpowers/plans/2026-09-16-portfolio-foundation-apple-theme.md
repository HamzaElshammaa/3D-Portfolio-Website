# Portfolio Foundation + Apple Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js project, the shared content model, the
theme-switching mechanism (2D card picker working immediately; Spline
wired in, activated once a scene URL is provided), and a fully working
**Apple-clean** theme end-to-end — plus lightweight placeholder pages for
the Brutalist and Terminal themes so the full 3-card picker flow works
today. Subsequent plans replace the placeholders with real themes.

**Architecture:** Next.js App Router renders a single client-side
`ThemeRenderer` that either shows the design-language picker (Spline 3D
when a scene URL + WebGL are available, otherwise a CSS/2D fallback) or
the selected theme's full component tree, pulled from a theme registry. A
`ThemeProvider` (React context) holds the active theme and exposes a
`reopenPicker` action used by a floating switcher. All themes render from
one shared, typed content object so copy/projects are authored once.

**Tech Stack:** Next.js (App Router) + React + TypeScript, Tailwind CSS,
Framer Motion (transitions), `@splinetool/react-spline` (3D picker),
Resend (contact form email), Vitest + React Testing Library (unit/component
tests), deployed to Vercel.

**Spec:** [docs/superpowers/specs/2026-09-16-portfolio-site-design.md](../specs/2026-09-16-portfolio-site-design.md)

## Global Constraints

- Framework: Next.js (App Router) + React + TypeScript; styling: Tailwind CSS.
- Three design languages: `apple`, `brutalist`, `terminal` — each theme
  gets its own full set of section components, never a CSS-variable-only
  skin, because layouts differ structurally between themes.
- One shared content data source drives all themes (projects, about copy,
  services, testimonials, contact info).
- Every visit starts at the card-pick intro; no theme choice is persisted
  across visits (no localStorage).
- A persistent floating control must remain available once a theme is
  active, allowing the visitor to reopen the picker and switch themes at
  any time.
- 3D picker is authored in Spline (`@splinetool/react-spline` +
  `@splinetool/runtime`); a CSS/2D fallback must exist for devices without
  WebGL or with `prefers-reduced-motion` set, or when no Spline scene URL
  is configured yet.
- Contact form posts to a Next.js API route which sends email via Resend;
  the Resend API key is read from an environment variable, never
  committed.
- No resume/CV download, no light/dark toggle within a theme, no
  persisted theme choice, no dedicated case-study sub-pages — out of
  scope per spec.

---

## File Structure

```
package.json, tsconfig.json, tailwind.config.ts, next.config.mjs, vitest.config.ts
app/
  layout.tsx              # root layout, fonts, global styles
  page.tsx                # renders <ThemeRenderer />
  globals.css             # Tailwind base + minimal resets
  api/contact/route.ts    # POST handler -> Resend
content/
  site-content.ts         # shared content object + types
lib/
  theme-context.tsx        # ThemeProvider, useTheme
  device-support.ts         # useWebGLSupported, usePrefersReducedMotion, pure chooseVariant()
components/
  ThemeRenderer.tsx         # picker <-> theme tree switch, cross-fade
  FloatingSwitcher.tsx       # fixed control, calls reopenPicker
  picker/
    PickerGate.tsx           # decides Spline vs 2D vs none
    CardPicker2D.tsx         # CSS/2D fallback picker
    SplinePicker.tsx          # Spline embed + click->theme mapping
themes/
  registry.tsx              # theme id -> component set
  ComingSoon.tsx             # shared placeholder for unbuilt themes
  apple/
    NavFooter.tsx
    Hero.tsx
    Work.tsx
    AboutServices.tsx
    Testimonials.tsx
    Contact.tsx
    AppleTheme.tsx            # assembles the above into the full page
tests/
  (co-located *.test.ts(x) files next to each source file)
```

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`,
  `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`,
  `vitest.setup.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`,
  `.gitignore`, `.env.example`

**Interfaces:**
- Produces: a running Next.js dev server at `/`, Tailwind available via
  `className`, Vitest configured to run `*.test.ts(x)` files with jsdom
  and `@testing-library/jest-dom` matchers.

- [ ] **Step 1: Scaffold Next.js app**

```bash
npx create-next-app@latest . --yes --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --no-turbopack --use-npm
```

`--yes` accepts defaults for any prompt the explicit flags do not cover,
so the command never blocks waiting on input. This creates
`package.json`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`,
`app/globals.css`, and Tailwind wiring. The installed Tailwind may be v4
(CSS-first, no `tailwind.config.ts`) or v3 (with a config file) — either
is fine, because every theme in this project styles with literal
arbitrary values (e.g. `bg-[#FAFAFA]`), which both versions support.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install framer-motion @splinetool/react-spline @splinetool/runtime resend
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Add Vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    passWithNoTests: true,
  },
});
```

The `@` alias must mirror the `@/*` path mapping create-next-app wrote
into `tsconfig.json` — later tasks' tests import through `@/lib/...`,
`@/content/...` and `@/themes/...`, and without this alias Vitest cannot
resolve them. `passWithNoTests` lets Step 7 verify the runner before any
test file exists.

Create `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add test script to package.json**

Edit `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Add `.env.example`**

Create `.env.example`:

```
RESEND_API_KEY=
CONTACT_TO_EMAIL=
NEXT_PUBLIC_SPLINE_SCENE_URL=
```

- [ ] **Step 6: Ignore the controller scratch directory**

Append to `.gitignore` (create-next-app generated it; do not remove its
existing entries):

```
# superpowers controller scratch
.superpowers/
```

- [ ] **Step 7: Verify dev server runs**

Run: `npm run dev`
Expected: server starts on `http://localhost:3000` without errors; stop
it with Ctrl+C once confirmed.

- [ ] **Step 8: Verify test runner works**

Run: `npm test`
Expected: exits 0 reporting "No test files found" — `passWithNoTests`
makes this a pass, confirming Vitest is wired correctly before any tests
exist.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Tailwind and Vitest"
```

---

### Task 2: Shared content model

**Files:**
- Create: `content/site-content.ts`
- Test: `content/site-content.test.ts`

**Interfaces:**
- Produces: `siteContent: SiteContent` (default export `content`), and
  exported types `SiteContent`, `Project`, `Testimonial`, `ServiceItem`
  used by every theme's components.

- [ ] **Step 1: Write the failing test**

Create `content/site-content.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- content/site-content.test.ts`
Expected: FAIL with "Cannot find module './site-content'"

- [ ] **Step 3: Write the content model**

Create `content/site-content.ts`:

```typescript
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

export interface SiteContent {
  hero: {
    headline: string;
    subhead: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
  projects: Project[];
  about: {
    narrative: string;
    skills: string[];
  };
  services: ServiceItem[];
  testimonials: Testimonial[];
  contact: {
    email: string;
    calendlyUrl: string;
    socials: { label: string; url: string }[];
  };
}

export const content: SiteContent = {
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
  about: {
    narrative:
      'I help clients ship products faster without sacrificing polish — from first pixel to production deploy.',
    skills: ['React', 'Next.js', 'React Native', 'TypeScript', 'Tailwind CSS'],
  },
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- content/site-content.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add content/site-content.ts content/site-content.test.ts
git commit -m "feat: add shared site content model"
```

---

### Task 3: Theme context

**Files:**
- Create: `lib/theme-context.tsx`
- Test: `lib/theme-context.test.tsx`

**Interfaces:**
- Consumes: nothing external.
- Produces: `type ThemeId = 'apple' | 'brutalist' | 'terminal'`,
  `ThemeProvider` component, `useTheme()` hook returning
  `{ activeTheme: ThemeId | null; selectTheme: (id: ThemeId) => void; reopenPicker: () => void }`.

- [ ] **Step 1: Write the failing test**

Create `lib/theme-context.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from './theme-context';

function Probe() {
  const { activeTheme, selectTheme, reopenPicker } = useTheme();
  return (
    <div>
      <span data-testid="active">{activeTheme ?? 'none'}</span>
      <button onClick={() => selectTheme('apple')}>pick apple</button>
      <button onClick={reopenPicker}>reopen</button>
    </div>
  );
}

describe('ThemeProvider / useTheme', () => {
  it('starts with no active theme', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    expect(screen.getByTestId('active')).toHaveTextContent('none');
  });

  it('selectTheme sets the active theme', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    await user.click(screen.getByText('pick apple'));
    expect(screen.getByTestId('active')).toHaveTextContent('apple');
  });

  it('reopenPicker clears the active theme', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    await user.click(screen.getByText('pick apple'));
    await user.click(screen.getByText('reopen'));
    expect(screen.getByTestId('active')).toHaveTextContent('none');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/theme-context.test.tsx`
Expected: FAIL with "Cannot find module './theme-context'"

- [ ] **Step 3: Implement the context**

Create `lib/theme-context.tsx`:

```tsx
'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type ThemeId = 'apple' | 'brutalist' | 'terminal';

interface ThemeContextValue {
  activeTheme: ThemeId | null;
  selectTheme: (id: ThemeId) => void;
  reopenPicker: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<ThemeId | null>(null);

  const selectTheme = useCallback((id: ThemeId) => {
    setActiveTheme(id);
  }, []);

  const reopenPicker = useCallback(() => {
    setActiveTheme(null);
  }, []);

  const value = useMemo(
    () => ({ activeTheme, selectTheme, reopenPicker }),
    [activeTheme, selectTheme, reopenPicker]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/theme-context.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/theme-context.tsx lib/theme-context.test.tsx
git commit -m "feat: add theme context for active theme and switching"
```

---

### Task 4: Device support helpers

**Files:**
- Create: `lib/device-support.ts`
- Test: `lib/device-support.test.ts`

**Interfaces:**
- Produces: pure function `choosePickerVariant(input: { hasWebGL: boolean; prefersReducedMotion: boolean; hasSceneUrl: boolean }): 'spline' | '2d'`,
  plus hooks `useWebGLSupported(): boolean` and
  `usePrefersReducedMotion(): boolean` (thin wrappers used by
  `PickerGate` in Task 6 — not exercised by unit tests here since they
  read `window`/`navigator`, which the pure function's tests cover the
  logic for).

- [ ] **Step 1: Write the failing test**

Create `lib/device-support.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { choosePickerVariant } from './device-support';

describe('choosePickerVariant', () => {
  it('uses spline when webgl is supported, motion is fine, and a scene url exists', () => {
    expect(
      choosePickerVariant({ hasWebGL: true, prefersReducedMotion: false, hasSceneUrl: true })
    ).toBe('spline');
  });

  it('falls back to 2d when webgl is unsupported', () => {
    expect(
      choosePickerVariant({ hasWebGL: false, prefersReducedMotion: false, hasSceneUrl: true })
    ).toBe('2d');
  });

  it('falls back to 2d when the visitor prefers reduced motion', () => {
    expect(
      choosePickerVariant({ hasWebGL: true, prefersReducedMotion: true, hasSceneUrl: true })
    ).toBe('2d');
  });

  it('falls back to 2d when no scene url is configured', () => {
    expect(
      choosePickerVariant({ hasWebGL: true, prefersReducedMotion: false, hasSceneUrl: false })
    ).toBe('2d');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/device-support.test.ts`
Expected: FAIL with "Cannot find module './device-support'"

- [ ] **Step 3: Implement**

Create `lib/device-support.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';

export function choosePickerVariant(input: {
  hasWebGL: boolean;
  prefersReducedMotion: boolean;
  hasSceneUrl: boolean;
}): 'spline' | '2d' {
  if (!input.hasSceneUrl) return '2d';
  if (!input.hasWebGL) return '2d';
  if (input.prefersReducedMotion) return '2d';
  return 'spline';
}

export function useWebGLSupported(): boolean {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setSupported(Boolean(gl));
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);
  return reduced;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/device-support.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/device-support.ts lib/device-support.test.ts
git commit -m "feat: add device-support detection for picker variant choice"
```

---

### Task 5: 2D fallback picker

**Files:**
- Create: `components/picker/CardPicker2D.tsx`
- Test: `components/picker/CardPicker2D.test.tsx`

**Interfaces:**
- Consumes: `ThemeId` from `lib/theme-context`.
- Produces: `CardPicker2D({ onSelectTheme }: { onSelectTheme: (id: ThemeId) => void })`.

- [ ] **Step 1: Write the failing test**

Create `components/picker/CardPicker2D.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardPicker2D } from './CardPicker2D';

describe('CardPicker2D', () => {
  it('renders three cards for apple, brutalist, and terminal', () => {
    render(<CardPicker2D onSelectTheme={() => {}} />);
    expect(screen.getByText(/apple/i)).toBeInTheDocument();
    expect(screen.getByText(/brutalist/i)).toBeInTheDocument();
    expect(screen.getByText(/terminal/i)).toBeInTheDocument();
  });

  it('calls onSelectTheme with the correct id when a card is clicked', async () => {
    const user = userEvent.setup();
    const onSelectTheme = vi.fn();
    render(<CardPicker2D onSelectTheme={onSelectTheme} />);
    await user.click(screen.getByTestId('card-brutalist'));
    expect(onSelectTheme).toHaveBeenCalledWith('brutalist');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/picker/CardPicker2D.test.tsx`
Expected: FAIL with "Cannot find module './CardPicker2D'"

- [ ] **Step 3: Implement**

Create `components/picker/CardPicker2D.tsx`:

```tsx
'use client';

import type { ThemeId } from '@/lib/theme-context';

const CARDS: { id: ThemeId; label: string; description: string }[] = [
  { id: 'apple', label: 'Apple-clean', description: 'Minimal. Calm. Premium.' },
  { id: 'brutalist', label: 'Brutalist', description: 'Bold. Editorial. Uncompromising.' },
  { id: 'terminal', label: 'Terminal', description: 'Technical. Precise. Engineered.' },
];

export function CardPicker2D({
  onSelectTheme,
}: {
  onSelectTheme: (id: ThemeId) => void;
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center gap-8 bg-black px-6">
      {CARDS.map((card) => (
        <button
          key={card.id}
          data-testid={`card-${card.id}`}
          onClick={() => onSelectTheme(card.id)}
          className="flex h-80 w-56 flex-col justify-end rounded-2xl border border-white/10 bg-white/5 p-6 text-left text-white transition-transform hover:-translate-y-2 hover:border-white/30"
        >
          <span className="text-xl font-semibold">{card.label}</span>
          <span className="mt-2 text-sm text-white/60">{card.description}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/picker/CardPicker2D.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add components/picker/CardPicker2D.tsx components/picker/CardPicker2D.test.tsx
git commit -m "feat: add 2D fallback design-language picker"
```

---

### Task 6: Spline picker wrapper

**Files:**
- Create: `components/picker/SplinePicker.tsx`
- Test: `components/picker/SplinePicker.test.tsx`

**Interfaces:**
- Consumes: `ThemeId`, the `Spline` component from `@splinetool/react-spline`.
- Produces: `SplinePicker({ sceneUrl, onSelectTheme }: { sceneUrl: string; onSelectTheme: (id: ThemeId) => void })`.

- [ ] **Step 1: Write the failing test**

Create `components/picker/SplinePicker.test.tsx`. This mocks
`@splinetool/react-spline` so the test doesn't need real WebGL/network:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@splinetool/react-spline', () => ({
  default: ({ onSplineMouseDown }: { onSplineMouseDown: (e: SplineEvent) => void }) => (
    <div
      data-testid="mock-spline"
      onMouseDown={() => onSplineMouseDown({ target: { name: 'Card_Brutalist', id: 'x' } })}
    />
  ),
}));

import { SplinePicker } from './SplinePicker';

describe('SplinePicker', () => {
  it('maps a clicked Spline object name to the matching theme id', async () => {
    const user = userEvent.setup();
    const onSelectTheme = vi.fn();
    render(<SplinePicker sceneUrl="https://example.com/scene.splinecode" onSelectTheme={onSelectTheme} />);
    await user.click(screen.getByTestId('mock-spline'));
    expect(onSelectTheme).toHaveBeenCalledWith('brutalist');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/picker/SplinePicker.test.tsx`
Expected: FAIL with "Cannot find module './SplinePicker'"

- [ ] **Step 3: Implement**

Create `components/picker/SplinePicker.tsx`:

```tsx
'use client';

import Spline from '@splinetool/react-spline';
import type { SplineEvent } from '@splinetool/react-spline';
import type { ThemeId } from '@/lib/theme-context';

const OBJECT_NAME_TO_THEME: Record<string, ThemeId> = {
  Card_Apple: 'apple',
  Card_Brutalist: 'brutalist',
  Card_Terminal: 'terminal',
};

export function SplinePicker({
  sceneUrl,
  onSelectTheme,
}: {
  sceneUrl: string;
  onSelectTheme: (id: ThemeId) => void;
}) {
  function handleSplineMouseDown(e: SplineEvent) {
    const theme = OBJECT_NAME_TO_THEME[e.target.name];
    if (theme) {
      onSelectTheme(theme);
    }
  }

  return (
    <div className="relative h-screen w-full">
      <Spline scene={sceneUrl} onSplineMouseDown={handleSplineMouseDown} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/picker/SplinePicker.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add components/picker/SplinePicker.tsx components/picker/SplinePicker.test.tsx
git commit -m "feat: add Spline 3D picker with click-to-theme mapping"
```

---

### Task 7: Picker gate

**Files:**
- Create: `components/picker/PickerGate.tsx`
- Test: `components/picker/PickerGate.test.tsx`

**Interfaces:**
- Consumes: `choosePickerVariant`, `useWebGLSupported`,
  `usePrefersReducedMotion` from `lib/device-support`; `CardPicker2D`;
  `SplinePicker`.
- Produces: `PickerGate({ onSelectTheme }: { onSelectTheme: (id: ThemeId) => void })`
  — renders `SplinePicker` or `CardPicker2D` based on
  `choosePickerVariant`, reading `NEXT_PUBLIC_SPLINE_SCENE_URL` from env.

- [ ] **Step 1: Write the failing test**

Create `components/picker/PickerGate.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/device-support', async () => {
  const actual = await vi.importActual<typeof import('@/lib/device-support')>('@/lib/device-support');
  return {
    ...actual,
    useWebGLSupported: vi.fn(),
    usePrefersReducedMotion: vi.fn(),
  };
});
vi.mock('./SplinePicker', () => ({
  SplinePicker: () => <div data-testid="spline-picker" />,
}));
vi.mock('./CardPicker2D', () => ({
  CardPicker2D: () => <div data-testid="2d-picker" />,
}));

import { useWebGLSupported, usePrefersReducedMotion } from '@/lib/device-support';
import { PickerGate } from './PickerGate';

describe('PickerGate', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SPLINE_SCENE_URL', 'https://example.com/scene.splinecode');
  });

  it('renders the Spline picker when webgl is supported and motion is fine', () => {
    vi.mocked(useWebGLSupported).mockReturnValue(true);
    vi.mocked(usePrefersReducedMotion).mockReturnValue(false);
    render(<PickerGate onSelectTheme={() => {}} />);
    expect(screen.getByTestId('spline-picker')).toBeInTheDocument();
  });

  it('renders the 2D picker when webgl is unsupported', () => {
    vi.mocked(useWebGLSupported).mockReturnValue(false);
    vi.mocked(usePrefersReducedMotion).mockReturnValue(false);
    render(<PickerGate onSelectTheme={() => {}} />);
    expect(screen.getByTestId('2d-picker')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/picker/PickerGate.test.tsx`
Expected: FAIL with "Cannot find module './PickerGate'"

- [ ] **Step 3: Implement**

Create `components/picker/PickerGate.tsx`:

```tsx
'use client';

import type { ThemeId } from '@/lib/theme-context';
import { choosePickerVariant, useWebGLSupported, usePrefersReducedMotion } from '@/lib/device-support';
import { SplinePicker } from './SplinePicker';
import { CardPicker2D } from './CardPicker2D';

export function PickerGate({ onSelectTheme }: { onSelectTheme: (id: ThemeId) => void }) {
  const hasWebGL = useWebGLSupported();
  const prefersReducedMotion = usePrefersReducedMotion();
  const sceneUrl = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL ?? '';

  const variant = choosePickerVariant({
    hasWebGL,
    prefersReducedMotion,
    hasSceneUrl: Boolean(sceneUrl),
  });

  if (variant === 'spline') {
    return <SplinePicker sceneUrl={sceneUrl} onSelectTheme={onSelectTheme} />;
  }
  return <CardPicker2D onSelectTheme={onSelectTheme} />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/picker/PickerGate.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add components/picker/PickerGate.tsx components/picker/PickerGate.test.tsx
git commit -m "feat: add PickerGate to choose Spline vs 2D fallback"
```

---

### Task 8: Floating switcher

**Files:**
- Create: `components/FloatingSwitcher.tsx`
- Test: `components/FloatingSwitcher.test.tsx`

**Interfaces:**
- Consumes: `useTheme` from `lib/theme-context`.
- Produces: `FloatingSwitcher()` — fixed-position button calling
  `reopenPicker()` on click.

- [ ] **Step 1: Write the failing test**

Create `components/FloatingSwitcher.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const reopenPicker = vi.fn();
vi.mock('@/lib/theme-context', () => ({
  useTheme: () => ({ activeTheme: 'apple', selectTheme: vi.fn(), reopenPicker }),
}));

import { FloatingSwitcher } from './FloatingSwitcher';

describe('FloatingSwitcher', () => {
  it('calls reopenPicker when clicked', async () => {
    const user = userEvent.setup();
    render(<FloatingSwitcher />);
    await user.click(screen.getByRole('button', { name: /switch design/i }));
    expect(reopenPicker).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/FloatingSwitcher.test.tsx`
Expected: FAIL with "Cannot find module './FloatingSwitcher'"

- [ ] **Step 3: Implement**

Create `components/FloatingSwitcher.tsx`:

```tsx
'use client';

import { useTheme } from '@/lib/theme-context';

export function FloatingSwitcher() {
  const { reopenPicker } = useTheme();
  return (
    <button
      onClick={reopenPicker}
      aria-label="Switch design language"
      className="fixed bottom-6 right-6 z-50 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-sm text-white backdrop-blur transition-colors hover:bg-black/90"
    >
      Switch design
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/FloatingSwitcher.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add components/FloatingSwitcher.tsx components/FloatingSwitcher.test.tsx
git commit -m "feat: add floating switcher to reopen the theme picker"
```

---

### Task 9: Coming-soon placeholder theme

**Files:**
- Create: `themes/ComingSoon.tsx`
- Test: `themes/ComingSoon.test.tsx`

**Interfaces:**
- Produces: `ComingSoon({ themeLabel }: { themeLabel: string })` — full-
  screen placeholder used by the registry for themes not yet built.

- [ ] **Step 1: Write the failing test**

Create `themes/ComingSoon.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComingSoon } from './ComingSoon';

describe('ComingSoon', () => {
  it('renders the given theme label', () => {
    render(<ComingSoon themeLabel="Brutalist" />);
    expect(screen.getByText(/brutalist/i)).toBeInTheDocument();
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- themes/ComingSoon.test.tsx`
Expected: FAIL with "Cannot find module './ComingSoon'"

- [ ] **Step 3: Implement**

Create `themes/ComingSoon.tsx`:

```tsx
export function ComingSoon({ themeLabel }: { themeLabel: string }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-neutral-950 text-white">
      <h1 className="text-3xl font-semibold">{themeLabel} theme coming soon</h1>
      <p className="text-white/60">Use the switcher to try another design language.</p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- themes/ComingSoon.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add themes/ComingSoon.tsx themes/ComingSoon.test.tsx
git commit -m "feat: add coming-soon placeholder for unbuilt themes"
```

---

### Task 10: REMOVED (pre-flight ruling)

The Apple theme tokens module was dropped before execution: no consumer
imported it and its test asserted only key-existence. Tasks 11-17 carry
complete literal color values, which is the form Tailwind arbitrary
values require. Task numbering keeps this gap deliberately.

---

### Task 11: Apple Nav + Footer

**Files:**
- Create: `themes/apple/NavFooter.tsx`
- Test: `themes/apple/NavFooter.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks — colors are literal values in the
  code below (`#1D1D1F` text, `#0071E3` accent, `#E5E5EA` border,
  `#6E6E73` muted, `#FAFAFA` canvas), the same palette every other Apple
  task uses.
- Produces: `AppleNav()` and `AppleFooter({ socials }: { socials: { label: string; url: string }[] })`.

- [ ] **Step 1: Write the failing test**

Create `themes/apple/NavFooter.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- themes/apple/NavFooter.test.tsx`
Expected: FAIL with "Cannot find module './NavFooter'"

- [ ] **Step 3: Implement**

Create `themes/apple/NavFooter.tsx`:

```tsx
const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' },
];

export function AppleNav() {
  return (
    <nav className="fixed top-0 z-40 flex w-full items-center justify-between bg-white/70 px-8 py-4 backdrop-blur-md">
      <span className="font-semibold text-[#1D1D1F]">Portfolio</span>
      <div className="flex gap-6">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} className="text-sm text-[#1D1D1F] hover:text-[#0071E3]">
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function AppleFooter({ socials }: { socials: { label: string; url: string }[] }) {
  return (
    <footer className="flex w-full flex-col items-center gap-4 border-t border-[#E5E5EA] bg-white py-10 text-sm text-[#6E6E73]">
      <div className="flex gap-4">
        {socials.map((social) => (
          <a key={social.label} href={social.url} className="hover:text-[#0071E3]">
            {social.label}
          </a>
        ))}
      </div>
      <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
    </footer>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- themes/apple/NavFooter.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add themes/apple/NavFooter.tsx themes/apple/NavFooter.test.tsx
git commit -m "feat: add Apple theme nav and footer"
```

---

### Task 12: Apple Hero

**Files:**
- Create: `themes/apple/Hero.tsx`
- Test: `themes/apple/Hero.test.tsx`

**Interfaces:**
- Consumes: `SiteContent['hero']` from `content/site-content`.
- Produces: `AppleHero({ hero }: { hero: SiteContent['hero'] })`.

- [ ] **Step 1: Write the failing test**

Create `themes/apple/Hero.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- themes/apple/Hero.test.tsx`
Expected: FAIL with "Cannot find module './Hero'"

- [ ] **Step 3: Implement**

Create `themes/apple/Hero.tsx`:

```tsx
import type { SiteContent } from '@/content/site-content';

export function AppleHero({ hero }: { hero: SiteContent['hero'] }) {
  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-[#FAFAFA] px-6 text-center">
      <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-[#1D1D1F]">{hero.headline}</h1>
      <p className="max-w-xl text-lg text-[#6E6E73]">{hero.subhead}</p>
      <div className="flex gap-4">
        <a href="#work" className="rounded-full bg-[#0071E3] px-6 py-3 text-sm font-medium text-white">
          {hero.primaryCtaLabel}
        </a>
        <a href="#contact" className="rounded-full border border-[#E5E5EA] px-6 py-3 text-sm font-medium text-[#1D1D1F]">
          {hero.secondaryCtaLabel}
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- themes/apple/Hero.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add themes/apple/Hero.tsx themes/apple/Hero.test.tsx
git commit -m "feat: add Apple theme hero section"
```

---

### Task 13: Apple Work

**Files:**
- Create: `themes/apple/Work.tsx`
- Test: `themes/apple/Work.test.tsx`

**Interfaces:**
- Consumes: `Project[]` from `content/site-content`.
- Produces: `AppleWork({ projects }: { projects: Project[] })`.

- [ ] **Step 1: Write the failing test**

Create `themes/apple/Work.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- themes/apple/Work.test.tsx`
Expected: FAIL with "Cannot find module './Work'"

- [ ] **Step 3: Implement**

Create `themes/apple/Work.tsx`:

```tsx
import type { Project } from '@/content/site-content';

export function AppleWork({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="w-full bg-white px-6 py-24">
      <h2 className="mb-12 text-center text-3xl font-semibold text-[#1D1D1F]">Selected Work</h2>
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.liveUrl}
            aria-label={project.name}
            className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E5EA] bg-[#FAFAFA] shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="aspect-video bg-[#E5E5EA]" />
            <div className="flex flex-col gap-2 p-6">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">{project.name}</h3>
              <p className="text-sm text-[#6E6E73]">{project.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span key={tech} className="rounded-full bg-[#E5E5EA] px-3 py-1 text-xs text-[#1D1D1F]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- themes/apple/Work.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add themes/apple/Work.tsx themes/apple/Work.test.tsx
git commit -m "feat: add Apple theme work/projects section"
```

---

### Task 14: Apple About + Services

**Files:**
- Create: `themes/apple/AboutServices.tsx`
- Test: `themes/apple/AboutServices.test.tsx`

**Interfaces:**
- Consumes: `SiteContent['about']`, `ServiceItem[]`.
- Produces: `AppleAboutServices({ about, services }: { about: SiteContent['about']; services: ServiceItem[] })`.

- [ ] **Step 1: Write the failing test**

Create `themes/apple/AboutServices.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- themes/apple/AboutServices.test.tsx`
Expected: FAIL with "Cannot find module './AboutServices'"

- [ ] **Step 3: Implement**

Create `themes/apple/AboutServices.tsx`:

```tsx
import type { SiteContent, ServiceItem } from '@/content/site-content';

export function AppleAboutServices({
  about,
  services,
}: {
  about: SiteContent['about'];
  services: ServiceItem[];
}) {
  return (
    <>
      <section id="about" className="w-full bg-[#FAFAFA] px-6 py-24 text-center">
        <p className="mx-auto max-w-2xl text-2xl font-medium text-[#1D1D1F]">{about.narrative}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {about.skills.map((skill) => (
            <span key={skill} className="rounded-full border border-[#E5E5EA] px-4 py-2 text-sm text-[#6E6E73]">
              {skill}
            </span>
          ))}
        </div>
      </section>
      <section id="services" className="w-full bg-white px-6 py-24">
        <h2 className="mb-12 text-center text-3xl font-semibold text-[#1D1D1F]">Services</h2>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="rounded-2xl border border-[#E5E5EA] p-6">
              <h3 className="mb-2 text-lg font-semibold text-[#1D1D1F]">{service.title}</h3>
              <p className="text-sm text-[#6E6E73]">{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- themes/apple/AboutServices.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add themes/apple/AboutServices.tsx themes/apple/AboutServices.test.tsx
git commit -m "feat: add Apple theme about and services sections"
```

---

### Task 15: Apple Testimonials

**Files:**
- Create: `themes/apple/Testimonials.tsx`
- Test: `themes/apple/Testimonials.test.tsx`

**Interfaces:**
- Consumes: `Testimonial[]`.
- Produces: `AppleTestimonials({ testimonials }: { testimonials: Testimonial[] })`.

- [ ] **Step 1: Write the failing test**

Create `themes/apple/Testimonials.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppleTestimonials } from './Testimonials';

const testimonials = [
  { quote: 'Great to work with.', name: 'Jane Doe', role: 'Founder' },
  { quote: 'Shipped fast.', name: 'John Smith', role: 'PM' },
];

describe('AppleTestimonials', () => {
  it('renders each testimonial quote and attribution', () => {
    render(<AppleTestimonials testimonials={testimonials} />);
    expect(screen.getByText('“Great to work with.”')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe, Founder')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- themes/apple/Testimonials.test.tsx`
Expected: FAIL with "Cannot find module './Testimonials'"

- [ ] **Step 3: Implement**

Create `themes/apple/Testimonials.tsx`:

```tsx
import type { Testimonial } from '@/content/site-content';

export function AppleTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="w-full bg-[#FAFAFA] px-6 py-24">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {testimonials.map((testimonial) => (
          <blockquote key={testimonial.name} className="rounded-2xl border border-[#E5E5EA] bg-white p-8">
            <p className="text-lg text-[#1D1D1F]">&ldquo;{testimonial.quote}&rdquo;</p>
            <footer className="mt-4 text-sm text-[#6E6E73]">
              {testimonial.name}, {testimonial.role}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- themes/apple/Testimonials.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add themes/apple/Testimonials.tsx themes/apple/Testimonials.test.tsx
git commit -m "feat: add Apple theme testimonials section"
```

---

### Task 16: Contact API route

**Files:**
- Create: `app/api/contact/route.ts`
- Test: `app/api/contact/route.test.ts`

**Interfaces:**
- Consumes: `resend` package, `process.env.RESEND_API_KEY`,
  `process.env.CONTACT_TO_EMAIL`.
- Produces: `POST(request: Request): Promise<Response>` — validates
  `{ name, email, message }`, returns 400 on invalid input, sends email
  and returns 200 on success, 500 if the email provider throws.

- [ ] **Step 1: Write the failing test**

Create `app/api/contact/route.test.ts`. This mocks the `resend` package
so no real network call happens. The mock implementation must be a
regular `function`, not an arrow function: the route calls
`new Resend(...)`, Vitest's spy forwards that through
`Reflect.construct`, and arrow functions are not constructible — an
arrow here fails with "is not a constructor" no matter what the route
does. Keep `sendMock` dereferenced inside the function body; hoisting it
into a class declaration outside the factory hits a temporal-dead-zone
error instead, because `vi.mock` factories are hoisted.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return { emails: { send: sendMock } };
  }),
}));

import { POST } from './route';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    sendMock.mockReset();
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubEnv('CONTACT_TO_EMAIL', 'owner@example.com');
  });

  it('returns 400 when required fields are missing', async () => {
    const response = await POST(makeRequest({ name: '', email: '', message: '' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when the email is invalid', async () => {
    const response = await POST(makeRequest({ name: 'A', email: 'not-an-email', message: 'hi' }));
    expect(response.status).toBe(400);
  });

  it('sends the email and returns 200 for valid input', async () => {
    sendMock.mockResolvedValue({ data: { id: 'abc' }, error: null });
    const response = await POST(
      makeRequest({ name: 'Jane', email: 'jane@example.com', message: 'Hello there' })
    );
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'owner@example.com',
      })
    );
    expect(response.status).toBe(200);
  });

  it('returns 500 when the email provider fails', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const response = await POST(
      makeRequest({ name: 'Jane', email: 'jane@example.com', message: 'Hello there' })
    );
    expect(response.status).toBe(500);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/api/contact/route.test.ts`
Expected: FAIL with "Cannot find module './route'"

- [ ] **Step 3: Implement**

Create `app/api/contact/route.ts`:

```typescript
import { Resend } from 'resend';

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(payload: Partial<ContactPayload>): string | null {
  if (!payload.name || !payload.name.trim()) return 'Name is required.';
  if (!payload.email || !isValidEmail(payload.email)) return 'A valid email is required.';
  if (!payload.message || !payload.message.trim()) return 'Message is required.';
  return null;
}

export async function POST(request: Request): Promise<Response> {
  let payload: Partial<ContactPayload>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== 'object' || parsed === null) {
      return Response.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    payload = parsed as Partial<ContactPayload>;
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const validationError = validate(payload);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: 'Portfolio Contact Form <onboarding@resend.dev>',
    to: process.env.CONTACT_TO_EMAIL as string,
    replyTo: payload.email,
    subject: `New message from ${payload.name}`,
    text: payload.message as string,
  });

  if (error) {
    return Response.json({ error: 'Failed to send message.' }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/api/contact/route.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add app/api/contact/route.ts app/api/contact/route.test.ts
git commit -m "feat: add contact form API route with Resend"
```

---

### Task 17: Apple Contact section

**Files:**
- Create: `themes/apple/Contact.tsx`
- Test: `themes/apple/Contact.test.tsx`

**Interfaces:**
- Consumes: `SiteContent['contact']`, `fetch('/api/contact')`.
- Produces: `AppleContact({ contact }: { contact: SiteContent['contact'] })`.

- [ ] **Step 1: Write the failing test**

Create `themes/apple/Contact.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppleContact } from './Contact';

const contact = {
  email: 'owner@example.com',
  calendlyUrl: 'https://calendly.com/example',
  socials: [{ label: 'GitHub', url: 'https://github.com/example' }],
};

describe('AppleContact', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  });

  it('renders direct email, calendly, and social links', () => {
    render(<AppleContact contact={contact} />);
    expect(screen.getByRole('link', { name: /email/i })).toHaveAttribute(
      'href',
      'mailto:owner@example.com'
    );
    expect(screen.getByRole('link', { name: /book a call/i })).toHaveAttribute(
      'href',
      'https://calendly.com/example'
    );
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/example'
    );
  });

  it('submits the form to /api/contact and shows a success message', async () => {
    const user = userEvent.setup();
    render(<AppleContact contact={contact} />);
    await user.type(screen.getByLabelText(/name/i), 'Jane');
    await user.type(screen.getByLabelText(/^email$/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello there');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST' })
    );
    await waitFor(() => expect(screen.getByText(/thanks/i)).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- themes/apple/Contact.test.tsx`
Expected: FAIL with "Cannot find module './Contact'"

- [ ] **Step 3: Implement**

Create `themes/apple/Contact.tsx`:

```tsx
'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SiteContent } from '@/content/site-content';

export function AppleContact({ contact }: { contact: SiteContent['contact'] }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    setStatus('sending');
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setStatus(response.ok ? 'sent' : 'error');
    if (response.ok) form.reset();
  }

  return (
    <section id="contact" className="w-full bg-white px-6 py-24">
      <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-[#1D1D1F]" htmlFor="name">
            Name
            <input id="name" name="name" required className="rounded-lg border border-[#E5E5EA] px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[#1D1D1F]" htmlFor="email">
            Email
            <input id="email" name="email" type="email" required className="rounded-lg border border-[#E5E5EA] px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[#1D1D1F]" htmlFor="message">
            Message
            <textarea id="message" name="message" required rows={4} className="rounded-lg border border-[#E5E5EA] px-3 py-2" />
          </label>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="rounded-full bg-[#0071E3] px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            Send message
          </button>
          {status === 'sent' && <p className="text-sm text-green-600">Thanks — I&apos;ll get back to you soon.</p>}
          {status === 'error' && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
        </form>
        <div className="flex flex-col gap-3 text-sm text-[#1D1D1F]">
          <a href={`mailto:${contact.email}`} className="hover:text-[#0071E3]">
            Email me directly
          </a>
          <a href={contact.calendlyUrl} className="hover:text-[#0071E3]">
            Book a call
          </a>
          {contact.socials.map((social) => (
            <a key={social.label} href={social.url} className="hover:text-[#0071E3]">
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- themes/apple/Contact.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add themes/apple/Contact.tsx themes/apple/Contact.test.tsx
git commit -m "feat: add Apple theme contact section with form and direct links"
```

---

### Task 18: Assemble Apple theme

**Files:**
- Create: `themes/apple/AppleTheme.tsx`
- Test: `themes/apple/AppleTheme.test.tsx`

**Interfaces:**
- Consumes: all Apple section components, `content` from
  `content/site-content`, `FloatingSwitcher`.
- Produces: `AppleTheme()` — the full assembled page for the `apple`
  theme, used by the registry in Task 19.

- [ ] **Step 1: Write the failing test**

Create `themes/apple/AppleTheme.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/theme-context', () => ({
  useTheme: () => ({ activeTheme: 'apple', selectTheme: vi.fn(), reopenPicker: vi.fn() }),
}));

import { AppleTheme } from './AppleTheme';
import { content } from '@/content/site-content';

describe('AppleTheme', () => {
  it('renders the hero headline and at least one project name', () => {
    render(<AppleTheme />);
    expect(screen.getByRole('heading', { name: content.hero.headline })).toBeInTheDocument();
    expect(screen.getByText(content.projects[0].name)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- themes/apple/AppleTheme.test.tsx`
Expected: FAIL with "Cannot find module './AppleTheme'"

- [ ] **Step 3: Implement**

Create `themes/apple/AppleTheme.tsx`:

```tsx
import { content } from '@/content/site-content';
import { FloatingSwitcher } from '@/components/FloatingSwitcher';
import { AppleNav, AppleFooter } from './NavFooter';
import { AppleHero } from './Hero';
import { AppleWork } from './Work';
import { AppleAboutServices } from './AboutServices';
import { AppleTestimonials } from './Testimonials';
import { AppleContact } from './Contact';

export function AppleTheme() {
  return (
    <div className="w-full">
      <AppleNav />
      <AppleHero hero={content.hero} />
      <AppleWork projects={content.projects} />
      <AppleAboutServices about={content.about} services={content.services} />
      <AppleTestimonials testimonials={content.testimonials} />
      <AppleContact contact={content.contact} />
      <AppleFooter socials={content.contact.socials} />
      <FloatingSwitcher />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- themes/apple/AppleTheme.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add themes/apple/AppleTheme.tsx themes/apple/AppleTheme.test.tsx
git commit -m "feat: assemble full Apple theme page"
```

---

### Task 19: Theme registry

**Files:**
- Create: `themes/registry.tsx`
- Test: `themes/registry.test.tsx`

**Interfaces:**
- Consumes: `ThemeId`, `AppleTheme`, `ComingSoon`.
- Produces: `themeRegistry: Record<ThemeId, () => ReactElement>` — each
  entry is a component, rendered by consumers as `<Entry />`, never called
  as `Entry()`.

- [ ] **Step 1: Write the failing test**

Create `themes/registry.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/theme-context', () => ({
  useTheme: () => ({ activeTheme: 'apple', selectTheme: vi.fn(), reopenPicker: vi.fn() }),
}));

import { themeRegistry } from './registry';
import { content } from '@/content/site-content';

describe('themeRegistry', () => {
  it('has an entry for apple, brutalist, and terminal', () => {
    expect(themeRegistry.apple).toBeDefined();
    expect(themeRegistry.brutalist).toBeDefined();
    expect(themeRegistry.terminal).toBeDefined();
  });

  it('renders the real Apple theme for "apple"', () => {
    const AppleEntry = themeRegistry.apple;
    render(<AppleEntry />);
    expect(screen.getByRole('heading', { name: content.hero.headline })).toBeInTheDocument();
  });

  it('renders a coming-soon placeholder for "brutalist"', () => {
    const BrutalistEntry = themeRegistry.brutalist;
    render(<BrutalistEntry />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it('renders a coming-soon placeholder for "terminal"', () => {
    const TerminalEntry = themeRegistry.terminal;
    render(<TerminalEntry />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- themes/registry.test.tsx`
Expected: FAIL with "Cannot find module './registry'"

- [ ] **Step 3: Implement**

Create `themes/registry.tsx`:

```tsx
import type { ReactElement } from 'react';
import type { ThemeId } from '@/lib/theme-context';
import { AppleTheme } from './apple/AppleTheme';
import { ComingSoon } from './ComingSoon';

export const themeRegistry: Record<ThemeId, () => ReactElement> = {
  apple: AppleTheme,
  brutalist: () => <ComingSoon themeLabel="Brutalist" />,
  terminal: () => <ComingSoon themeLabel="Terminal" />,
};
```

The file is `.tsx` because the placeholder entries render JSX. Entries
are components, so consumers render them as `<Entry />` — calling a
component as a plain function inlines its hooks into the caller's hook
order.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- themes/registry.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add themes/registry.tsx themes/registry.test.tsx
git commit -m "feat: add theme registry mapping theme ids to component trees"
```

---

### Task 20: ThemeRenderer with transition

**Files:**
- Create: `components/ThemeRenderer.tsx`
- Test: `components/ThemeRenderer.test.tsx`

**Interfaces:**
- Consumes: `useTheme`, `PickerGate`, `themeRegistry`, `motion`/`AnimatePresence`
  from `framer-motion`.
- Produces: `ThemeRenderer()` — the single component `app/page.tsx` renders.

- [ ] **Step 1: Write the failing test**

Create `components/ThemeRenderer.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('./picker/PickerGate', () => ({
  PickerGate: ({ onSelectTheme }: { onSelectTheme: (id: string) => void }) => (
    <button onClick={() => onSelectTheme('apple')}>pick apple</button>
  ),
}));
vi.mock('@/themes/registry', () => ({
  themeRegistry: {
    apple: () => <div data-testid="apple-theme" />,
    brutalist: () => <div data-testid="brutalist-theme" />,
    terminal: () => <div data-testid="terminal-theme" />,
  },
}));

import { ThemeProvider } from '@/lib/theme-context';
import { ThemeRenderer } from './ThemeRenderer';

describe('ThemeRenderer', () => {
  it('shows the picker before a theme is chosen', () => {
    render(
      <ThemeProvider>
        <ThemeRenderer />
      </ThemeProvider>
    );
    expect(screen.getByText('pick apple')).toBeInTheDocument();
  });

  it('renders the selected theme after picking a card', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeRenderer />
      </ThemeProvider>
    );
    await user.click(screen.getByText('pick apple'));
    expect(await screen.findByTestId('apple-theme')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/ThemeRenderer.test.tsx`
Expected: FAIL with "Cannot find module './ThemeRenderer'"

- [ ] **Step 3: Implement**

Create `components/ThemeRenderer.tsx`:

```tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import { themeRegistry } from '@/themes/registry';
import { PickerGate } from './picker/PickerGate';

export function ThemeRenderer() {
  const { activeTheme, selectTheme } = useTheme();
  const ActiveTheme = activeTheme ? themeRegistry[activeTheme] : null;

  return (
    <AnimatePresence mode="wait">
      {activeTheme === null ? (
        <motion.div
          key="picker"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.4 }}
        >
          <PickerGate onSelectTheme={selectTheme} />
        </motion.div>
      ) : (
        <motion.div
          key={activeTheme}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {ActiveTheme ? <ActiveTheme /> : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/ThemeRenderer.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add components/ThemeRenderer.tsx components/ThemeRenderer.test.tsx
git commit -m "feat: add ThemeRenderer with picker-to-theme transition"
```

---

### Task 21: Wire root page and layout

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `ThemeProvider`, `ThemeRenderer`.
- Produces: the deployed root route rendering the full app.

- [ ] **Step 1: Update the root layout**

Edit `app/layout.tsx` to wrap children in `ThemeProvider` and set page
metadata:

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Frontend developer portfolio — pick a design language to explore.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update the root page**

Replace the contents of `app/page.tsx`:

```tsx
import { ThemeRenderer } from '@/components/ThemeRenderer';

export default function Home() {
  return <ThemeRenderer />;
}
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS — all tests from Tasks 2–20 pass together.

- [ ] **Step 4: Manually verify in the browser**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: the 2D card picker appears (no Spline scene configured yet);
clicking the "Apple-clean" card transitions into the full Apple theme
page with a working nav, hero, work grid, about/services, testimonials,
and contact form; clicking "Brutalist" or "Terminal" shows the
coming-soon placeholder; the floating "Switch design" button reopens the
picker from any theme.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: wire ThemeProvider and ThemeRenderer into the root page"
```

---

## After This Plan

- **Plan 2:** Build out the Brutalist theme (`themes/brutalist/*`) reusing
  this plan's content model, `ThemeProvider`, `ThemeRenderer`, and
  registry — replace `themeRegistry.brutalist` placeholder with the real
  theme, following the same task pattern as Tasks 10–18.
- **Plan 3:** Build out the Terminal theme the same way.
- **Plan 4 (polish):** author the real Spline scene and set
  `NEXT_PUBLIC_SPLINE_SCENE_URL`; replace placeholder project/testimonial
  content with real assets; responsive QA pass across all three themes;
  Vercel deployment and environment variable setup.

'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type ThemeId = 'apple' | 'retro' | 'terminal';

export interface ThemeDescriptor {
  label: string;
  description: string;
  /** The Spline object name (from the picker scene) that selects this theme. */
  splineObjectName: string;
}

/**
 * The single source of truth for "what design languages exist". Keying by
 * `ThemeId` gives exhaustiveness for free — adding a fourth theme means
 * extending `ThemeId` above, which then fails to compile here (and at every
 * consumer below) until this record is updated too.
 */
export const THEMES: Record<ThemeId, ThemeDescriptor> = {
  apple: {
    label: 'Apple-clean',
    description: 'Minimal. Calm. Premium.',
    splineObjectName: 'Card_Apple',
  },
  retro: {
    label: 'Retro',
    description: 'CRT-glow. Scanlines. Nostalgic.',
    splineObjectName: 'Card_Retro',
  },
  terminal: {
    label: 'Terminal',
    description: 'Technical. Precise. Engineered.',
    splineObjectName: 'Card_Terminal',
  },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

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

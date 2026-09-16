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

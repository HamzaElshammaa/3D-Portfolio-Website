import type { ReactElement } from 'react';
import type { ThemeId } from '@/lib/theme-context';
import { AppleTheme } from './apple/AppleTheme';
import { ComingSoon } from './ComingSoon';

export const themeRegistry: Record<ThemeId, () => ReactElement> = {
  apple: AppleTheme,
  brutalist: () => <ComingSoon themeLabel="Brutalist" />,
  terminal: () => <ComingSoon themeLabel="Terminal" />,
};

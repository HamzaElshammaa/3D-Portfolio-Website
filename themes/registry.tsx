import type { ReactElement } from 'react';
import type { ThemeId } from '@/lib/theme-context';
import { THEMES } from '@/lib/theme-context';
import { AppleTheme } from './apple/AppleTheme';
import { ComingSoon } from './ComingSoon';

export const themeRegistry: Record<ThemeId, () => ReactElement> = {
  apple: AppleTheme,
  retro: () => <ComingSoon themeLabel={THEMES.retro.label} />,
  terminal: () => <ComingSoon themeLabel={THEMES.terminal.label} />,
};

'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import { themeRegistry } from '@/themes/registry';
import { PickerGate } from './picker/PickerGate';
import { FloatingSwitcher } from './FloatingSwitcher';

export function ThemeRenderer() {
  const { activeTheme, selectTheme } = useTheme();
  const ActiveTheme = activeTheme ? themeRegistry[activeTheme] : null;

  return (
    <>
      {/*
       * Do not reintroduce AnimatePresence or an `exit` prop here. The WAAPI
       * `finished` promise an exit animation depends on does not resolve
       * while the tab is hidden/backgrounded, which can wedge the switcher
       * or leave outgoing views mounted (invisible, but still in the tab
       * order and accessibility tree) indefinitely. A plain keyed
       * `motion.div` with only `initial`/`animate` sidesteps this: React's
       * normal reconciliation removes the outgoing subtree synchronously
       * when `activeTheme` changes, so correctness never depends on an
       * animation completing. We keep the entrance transition and drop the
       * exit fade.
       */}
      {activeTheme === null ? (
        <motion.div
          key="picker"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <PickerGate onSelectTheme={selectTheme} />
        </motion.div>
      ) : (
        <motion.div
          key={activeTheme}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {ActiveTheme ? <ActiveTheme /> : null}
        </motion.div>
      )}
      {/*
       * The switcher is app chrome, not theme content: it must appear once
       * a theme is active regardless of which theme (including future
       * themes that are just a ComingSoon placeholder), and it must not
       * appear over the picker itself.
       */}
      {activeTheme !== null && <FloatingSwitcher />}
    </>
  );
}

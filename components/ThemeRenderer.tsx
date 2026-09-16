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

'use client';

import { AnimatePresence, motion } from 'framer-motion';
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
       * mode="sync" (the default) is intentional: the incoming child mounts
       * immediately instead of waiting for the outgoing child's exit animation
       * to signal completion. AnimatePresence's mode="wait" makes every future
       * switch depend on that exit-complete callback firing — and that signal
       * is driven by the Web Animations API's `finished` promise, which
       * browsers can defer indefinitely while the tab is backgrounded/hidden
       * (verified directly: a raw `Element.animate().finished` promise did not
       * resolve after 1s with `document.hidden === true`). With mode="wait",
       * if a visitor switches tabs during the 0.4s transition, the picker (or
       * the next theme) never mounts and the switcher becomes permanently
       * unresponsive. Keeping the default mode means the new content is always
       * interactive right away; the old content simply finishes its fade-out
       * whenever the browser gets around to running it.
       */}
      <AnimatePresence>
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
      {/*
       * The switcher is app chrome, not theme content: render it here, once,
       * whenever a theme is active — regardless of which theme — so every
       * theme (including future placeholder-only ones) gets it for free
       * instead of each theme having to remember to include it. It must not
       * appear over the picker itself.
       */}
      {activeTheme !== null && <FloatingSwitcher />}
    </>
  );
}

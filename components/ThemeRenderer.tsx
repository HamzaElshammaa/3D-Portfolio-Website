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
       * No AnimatePresence, and no `exit` prop, here — deliberately.
       *
       * A previous version wrapped this swap in AnimatePresence with
       * mode="wait", which wedged the switcher (see the earlier fix in this
       * file's history: the outgoing child's exit-complete signal, driven by
       * the Web Animations API's `finished` promise, can be deferred
       * indefinitely by the browser while the tab is hidden/backgrounded).
       * Switching to AnimatePresence's default "sync" mode fixed the wedge,
       * but left a second problem: without `mode="wait"` blocking anything,
       * AnimatePresence still keeps every outgoing child mounted at
       * opacity: 0 until ITS OWN exit-complete signal fires — which is the
       * exact signal that can stall. In practice that meant the picker, the
       * Apple theme, and any placeholder all stayed in the DOM
       * simultaneously: invisible but still in the tab order and the
       * accessibility tree, and never cleaned up (accumulating with every
       * switch).
       *
       * The fix is to not depend on an exit animation completing at all.
       * Using a plain keyed `motion.div` with only `initial`/`animate` (no
       * `exit`, no AnimatePresence) means React's normal reconciliation
       * removes the outgoing subtree from the DOM synchronously the moment
       * `activeTheme` changes — no fade-out, but also nothing left behind to
       * be focused, read by a screen reader, or pile up across switches. The
       * incoming view still animates in (initial -> animate), which is the
       * transition that actually matters for the product's opening moment;
       * we're trading the exit fade for correctness, not dropping the
       * transition entirely.
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

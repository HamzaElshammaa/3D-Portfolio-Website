'use client';

import { useTheme } from '@/lib/theme-context';

export function FloatingSwitcher({
  onClick,
}: {
  /** Defaults to `reopenPicker` — the 2D flow's "switch" behavior. The
   * Spline flow overrides it with its own phase machine's switcher
   * handler instead, since returning to the scene there means starting a
   * reverse zoom, not an instant reopen. */
  onClick?: () => void;
} = {}) {
  const { reopenPicker } = useTheme();
  return (
    <button
      onClick={onClick ?? reopenPicker}
      aria-label="Switch design language"
      className="fixed bottom-6 right-6 z-50 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-sm text-white backdrop-blur transition-colors hover:bg-black/90"
    >
      Switch design
    </button>
  );
}

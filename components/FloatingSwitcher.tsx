'use client';

import { useTheme } from '@/lib/theme-context';

export function FloatingSwitcher({ onClick }: { onClick?: () => void } = {}) {
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

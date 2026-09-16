'use client';

import type { ThemeId } from '@/lib/theme-context';

const CARDS: { id: ThemeId; label: string; description: string }[] = [
  { id: 'apple', label: 'Apple-clean', description: 'Minimal. Calm. Premium.' },
  { id: 'brutalist', label: 'Brutalist', description: 'Bold. Editorial. Uncompromising.' },
  { id: 'terminal', label: 'Terminal', description: 'Technical. Precise. Engineered.' },
];

export function CardPicker2D({
  onSelectTheme,
}: {
  onSelectTheme: (id: ThemeId) => void;
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center gap-8 bg-black px-6">
      {CARDS.map((card) => (
        <button
          key={card.id}
          data-testid={`card-${card.id}`}
          onClick={() => onSelectTheme(card.id)}
          className="flex h-80 w-56 flex-col justify-end rounded-2xl border border-white/10 bg-white/5 p-6 text-left text-white transition-transform hover:-translate-y-2 hover:border-white/30"
        >
          <span className="text-xl font-semibold">{card.label}</span>
          <span className="mt-2 text-sm text-white/60">{card.description}</span>
        </button>
      ))}
    </div>
  );
}

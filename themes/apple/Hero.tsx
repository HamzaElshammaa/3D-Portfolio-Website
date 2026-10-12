import type { SiteContent } from '@/content/site-content';

export function AppleHero({ hero }: { hero: SiteContent['hero'] }) {
  return (
    <section className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden bg-[#000000] px-6 pt-24 pb-16 text-center">
      {/* Subtle radial ambient light inspired by Apple Keynote reveals */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(0, 113, 227, 0.45) 0%, rgba(138, 43, 226, 0.15) 50%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-neutral-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Available for High-Impact Projects</span>
        </div>

        <h1 className="max-w-4xl bg-gradient-to-b from-white via-white/95 to-neutral-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl">
          {hero.headline}
        </h1>

        <p className="max-w-2xl text-base text-[#86868B] sm:text-lg md:text-xl">
          {hero.subhead}
        </p>

        {/* Floating Apple-style Action Platter */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#work"
            className="rounded-full bg-[#0071E3] px-7 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#0077ED] hover:scale-[1.02] active:scale-[0.98]"
          >
            {hero.primaryCtaLabel}
          </a>
          <a
            href="#contact"
            className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            {hero.secondaryCtaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

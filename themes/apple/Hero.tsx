import type { SiteContent } from '@/content/site-content';

export function AppleHero({ hero }: { hero: SiteContent['hero'] }) {
  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-[#FAFAFA] px-6 text-center">
      <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-[#1D1D1F]">{hero.headline}</h1>
      <p className="max-w-xl text-lg text-[#6E6E73]">{hero.subhead}</p>
      <div className="flex gap-4">
        <a href="#work" className="rounded-full bg-[#0071E3] px-6 py-3 text-sm font-medium text-white">
          {hero.primaryCtaLabel}
        </a>
        <a href="#contact" className="rounded-full border border-[#E5E5EA] px-6 py-3 text-sm font-medium text-[#1D1D1F]">
          {hero.secondaryCtaLabel}
        </a>
      </div>
    </section>
  );
}

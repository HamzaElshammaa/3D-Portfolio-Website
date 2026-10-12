import type { Testimonial } from '@/content/site-content';

export function AppleTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="w-full border-t border-white/10 bg-[#000000] px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#0071E3]">
            Verified Endorsements
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Client Voices
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial.name}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#161617] p-8 shadow-xl transition-all hover:border-white/20"
            >
              <p className="text-lg leading-relaxed tracking-tight text-neutral-200 sm:text-xl">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <footer className="mt-8 text-sm font-medium text-[#86868B]">
                {testimonial.name}, {testimonial.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

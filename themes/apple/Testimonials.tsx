import type { Testimonial } from '@/content/site-content';

export function AppleTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="w-full bg-[#FAFAFA] px-6 py-24">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {testimonials.map((testimonial) => (
          <blockquote key={testimonial.name} className="rounded-2xl border border-[#E5E5EA] bg-white p-8">
            <p className="text-lg text-[#1D1D1F]">&ldquo;{testimonial.quote}&rdquo;</p>
            <footer className="mt-4 text-sm text-[#6E6E73]">
              {testimonial.name}, {testimonial.role}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

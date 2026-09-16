import type { SiteContent, ServiceItem } from '@/content/site-content';

export function AppleAboutServices({
  about,
  services,
}: {
  about: SiteContent['about'];
  services: ServiceItem[];
}) {
  return (
    <>
      <section id="about" className="w-full bg-[#FAFAFA] px-6 py-24 text-center">
        <p className="mx-auto max-w-2xl text-2xl font-medium text-[#1D1D1F]">{about.narrative}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {about.skills.map((skill) => (
            <span key={skill} className="rounded-full border border-[#E5E5EA] px-4 py-2 text-sm text-[#6E6E73]">
              {skill}
            </span>
          ))}
        </div>
      </section>
      <section id="services" className="w-full bg-white px-6 py-24">
        <h2 className="mb-12 text-center text-3xl font-semibold text-[#1D1D1F]">Services</h2>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="rounded-2xl border border-[#E5E5EA] p-6">
              <h3 className="mb-2 text-lg font-semibold text-[#1D1D1F]">{service.title}</h3>
              <p className="text-sm text-[#6E6E73]">{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

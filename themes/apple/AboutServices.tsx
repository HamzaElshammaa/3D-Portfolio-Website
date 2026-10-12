import type { SiteContent, ServiceItem } from '@/content/site-content';

export function AppleAboutServices({
  about,
  servicesHeading,
  services,
}: {
  about: SiteContent['about'];
  servicesHeading: string;
  services: ServiceItem[];
}) {
  return (
    <>
      <section id="about" className="w-full border-t border-white/10 bg-[#000000] px-6 py-28 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#0071E3]">
            Core Architecture
          </p>
          <p className="text-2xl font-medium leading-relaxed tracking-tight text-neutral-200 sm:text-3xl md:text-4xl">
            {about.narrative}
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-2.5">
            {about.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium tracking-tight text-neutral-300 backdrop-blur-md transition-colors hover:border-white/25 hover:text-white"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="w-full border-t border-white/10 bg-[#000000] px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#0071E3]">
              Capabilities
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {servicesHeading}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#161617] p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-2xl hover:shadow-black"
              >
                <div>
                  <span className="mb-4 inline-block font-mono text-xs font-semibold text-[#86868B]">
                    0{index + 1}
                  </span>
                  <h3 className="mb-3 text-xl font-semibold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#86868B]">
                    {service.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs font-medium text-[#0071E3] transition-colors group-hover:text-blue-300">
                  <span>Learn more</span>
                  <span aria-hidden="true">&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

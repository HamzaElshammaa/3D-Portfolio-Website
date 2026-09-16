import type { Project } from '@/content/site-content';

export function AppleWork({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="w-full bg-white px-6 py-24">
      <h2 className="mb-12 text-center text-3xl font-semibold text-[#1D1D1F]">Selected Work</h2>
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.liveUrl}
            aria-label={project.name}
            className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E5EA] bg-[#FAFAFA] shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="aspect-video bg-[#E5E5EA]" />
            <div className="flex flex-col gap-2 p-6">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">{project.name}</h3>
              <p className="text-sm text-[#6E6E73]">{project.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span key={tech} className="rounded-full bg-[#E5E5EA] px-3 py-1 text-xs text-[#1D1D1F]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

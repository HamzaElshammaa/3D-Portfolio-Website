'use client';

import { useState } from 'react';
import type { Project } from '@/content/site-content';

const KIND_LABEL: Record<Project['kind'], string> = {
  web: 'Web',
  mobile: 'Mobile',
};

function ProjectThumbnail({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="aspect-video w-full border-b border-white/10 bg-[#1D1D1F] flex items-center justify-center">
        <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
          {project.name}
        </span>
      </div>
    );
  }

  return (
    // Plain <img>, not next/image: real project screenshots are supplied later and
    // must degrade to the placeholder box above via onError, which next/image can't do.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={project.imageUrl}
      alt=""
      className="aspect-video w-full border-b border-white/10 bg-[#1D1D1F] object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function AppleWork({
  projects,
  heading,
}: {
  projects: Project[];
  heading: string;
}) {
  return (
    <section id="work" className="w-full bg-[#000000] px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#0071E3]">
            Engineered Systems
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {heading}
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <a
              key={project.id}
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={project.name}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161617] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-2xl hover:shadow-black"
            >
              <ProjectThumbnail project={project} />
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h3>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-neutral-400">
                      {KIND_LABEL[project.kind]}
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#86868B]">
                    {project.description}
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

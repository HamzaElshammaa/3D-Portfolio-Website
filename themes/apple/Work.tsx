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
    return <div className="aspect-video bg-[#E5E5EA]" />;
  }

  return (
    // Plain <img>, not next/image: real project screenshots are supplied later and
    // must degrade to the grey box above via onError, which next/image can't do.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={project.imageUrl}
      alt=""
      className="aspect-video w-full bg-[#E5E5EA] object-cover"
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
    <section id="work" className="w-full bg-white px-6 py-24">
      <h2 className="mb-12 text-center text-3xl font-semibold text-[#1D1D1F]">{heading}</h2>
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={project.name}
            className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E5EA] bg-[#FAFAFA] shadow-sm transition-shadow hover:shadow-lg"
          >
            <ProjectThumbnail project={project} />
            <div className="flex flex-col gap-2 p-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-[#1D1D1F]">{project.name}</h3>
                <span className="rounded-full bg-[#E5E5EA] px-2 py-0.5 text-xs text-[#6E6E73]">
                  {KIND_LABEL[project.kind]}
                </span>
              </div>
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

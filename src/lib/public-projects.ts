import type { Project } from "./types";

// Database samples remain private; this selects only the owner's published work.
export function publicProjects<T extends Pick<Project, "published" | "is_demo">>(projects: T[]): T[] {
  return projects.filter(project => project.published && project.is_demo === false);
}

// Local examples fill collections with no published real work yet. They never
// expose hidden database records or replace the owner's live work.
export function portfolioProjects<T extends Pick<Project, "id" | "slug" | "format" | "published" | "is_demo">>(records: T[], samples: T[], showSamples: boolean): T[] {
  const real = publicProjects(records);
  if (!showSamples) return real;
  const formats = new Set(real.map(project => project.format));
  const ids = new Set(real.map(project => project.id));
  const slugs = new Set(real.map(project => project.slug));
  return [...real, ...samples.filter(project => project.published && project.is_demo && !formats.has(project.format) && !ids.has(project.id) && !slugs.has(project.slug))];
}

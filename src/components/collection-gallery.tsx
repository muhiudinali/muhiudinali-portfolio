"use client";
import { ArrowUpRight } from "lucide-react";
import Link from "./page-link";
import { MediaGallery } from "./media-gallery";
import { ProjectCollections } from "./project-collections";
import { projectFormat } from "@/lib/collections";
import type { Project, ProjectFormat, ProjectMedia } from "@/lib/types";

export function CollectionGallery({ projects, format }: { projects: Project[]; format: ProjectFormat }) {
  const list = projects.filter(project => projectFormat(project) === format);
  const media: ProjectMedia[] = list.flatMap(project => {
    const items = format === "video-ads" ? project.media.filter(item => item.kind === "video") : project.media;
    return items.length ? items.map(item => ({ ...item, caption: `${project.title} · ${item.caption || item.alt}` })) : project.cover_url ? [{
      id: `cover-${project.id}`, project_id: project.id, kind: "image" as const, url: project.cover_url,
      poster_url: null, alt: `${project.title} cover`, caption: project.title, sort_order: 0,
    }] : [];
  });
  return <div className="collection-work" data-animation="expand-on-hover">
    <ProjectCollections projects={projects} active={format} onSelect={() => {}} opened={false} collectionPage />
    {media.length ? <MediaGallery key={media.map(item => item.id).join("|")} media={media} /> : <div className="empty-projects"><p>New work in this collection is on its way.</p><Link className="text-link" href="/contact">Discuss your project<ArrowUpRight size={18} /></Link></div>}
    {!!list.length && <nav className="collection-project-links" aria-label="Projects in this collection">{list.map(project => <Link key={project.id} href={`/projects/${project.slug}`}><span><span className="display">{project.title}</span><small>{project.is_demo ? "SAMPLE PROJECT" : project.category}</small></span><ArrowUpRight size={18} /></Link>)}</nav>}
  </div>;
}

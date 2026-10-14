"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "./page-link";
import type { Project } from "@/lib/types";
import { projectFormat } from "@/lib/collections";
import { ProjectCollections, type ProjectCollectionKey } from "./project-collections";

// Homepage keeps its existing corner composition. Project links navigate to
// details; the reference's shared cover/title transition lives only on /projects.
export function ProjectIndex({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState<ProjectCollectionKey>("All");
  const list = projects.filter(project => category === "All" || projectFormat(project) === category);
  const preview = list[0];
  return <>
    <ProjectCollections projects={projects} active={category} onSelect={setCategory} opened={false} />
    <div className={`project-canvas ${!list.length ? "is-empty" : ""}`} data-animation="project-links">
      {!preview ? <div className="empty-projects"><p>New work is on its way.</p><Link href="/contact" className="text-link">Discuss your project<ArrowUpRight size={18} /></Link></div> : <div className="project-index-view">
        <div className="project-preview-space"><Link className="project-preview" href={`/projects/${preview.slug}`} aria-label={`View ${preview.title}`}><img src={preview.cover_url!} alt={`${preview.title} cover`} loading="lazy" /><span className="preview-arrow"><ArrowUpRight /></span></Link><span className="preview-caption">{preview.category}<span>Explore the work ↗</span></span></div>
        <div className="project-list">{list.map((project, i) => <Link key={project.id} className="project-row" href={`/projects/${project.slug}`}><span className="project-index">{String(i + 1).padStart(2, "0")}</span><span><span className="project-title display">{project.title}</span><small>{project.category}{project.is_demo ? " · SAMPLE" : ""}</small></span><ArrowUpRight size={23} /></Link>)}</div>
        <span className="canvas-watermark display" aria-hidden="true">SELECTED / WORK</span>
      </div>}
    </div>
  </>;
}

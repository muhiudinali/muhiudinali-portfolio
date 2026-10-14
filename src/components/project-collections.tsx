import Link from "./page-link";
import { ArrowUpRight } from "lucide-react";
import { collections, collectionPath, projectFormat } from "@/lib/collections";
import type { Project, ProjectFormat } from "@/lib/types";

export type ProjectCollectionKey = "All" | ProjectFormat;
export function ProjectCollections({ projects, active, onSelect, opened, collectionPage = false }: {
  projects: Project[]; active: ProjectCollectionKey; onSelect: (key: ProjectCollectionKey) => void;
  opened: boolean; collectionPage?: boolean;
}) {
  const selected = collections.find(collection => collection.format === active);
  const options = [{ format: "All" as const, label: "All" }, ...collections];
  return <div className={`project-collection-nav ${opened ? "is-open" : ""}`} aria-hidden={opened} inert={opened}>
    <div className="project-filters" aria-label="Project collections">{options.map(option => {
      const count = option.format === "All" ? projects.length : projects.filter(project => projectFormat(project) === option.format).length;
      const children = <>{option.label}<span className="collection-count">{count}</span></>;
      return collectionPage
        ? <Link key={option.format} href={option.format === "All" ? "/projects" : collectionPath(option.format)} className={active === option.format ? "active" : ""} aria-current={active === option.format ? "page" : undefined}>{children}</Link>
        : <div key={option.format} className={`collection-filter-item ${active === option.format ? "active" : ""}`}><button onClick={() => onSelect(option.format)} aria-pressed={active === option.format}>{children}</button>{option.format !== "All" && <Link href={collectionPath(option.format)} aria-label={`Open ${option.label} collection`}><ArrowUpRight size={14} /></Link>}</div>;
    })}</div>
    <div className="project-collection-copy" aria-live="polite"><p>{selected?.description || "Explore image ads, video ads, web & app projects and brand identity work."}</p>{selected && !collectionPage && <Link className="text-link" href={collectionPath(selected.format)}>Open {selected.label.toLowerCase()} collection<ArrowUpRight size={16} /></Link>}</div>
  </div>;
}

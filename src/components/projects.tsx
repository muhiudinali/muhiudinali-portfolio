"use client";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowUpRight, Code2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "@/components/page-link";
import type { Project, ProjectFormat } from "@/lib/types";
import { MediaGallery } from "./media-gallery";
import { projectFormat } from "@/lib/collections";
import { ProjectCollections, type ProjectCollectionKey } from "./project-collections";

export function ProjectBody({ project }: { project: Project }) {
  return <div className="project-body">{project.is_demo && <p className="sample-project-badge">SAMPLE PROJECT · GENERATED VISUALS</p>}<div className="project-description"><p className="eyebrow">{project.category}</p><p className="project-summary">{project.summary}</p><div className="project-prose">{project.description.split(/\n\s*\n/).filter(Boolean).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div><div className="project-links">{project.external_url && <a className="button blue" href={project.external_url} target="_blank" rel="noopener noreferrer">Visit project<ArrowUpRight size={18} /></a>}{project.repository_url && <a className="button outline" href={project.repository_url} target="_blank" rel="noopener noreferrer"><Code2 size={17} />Source code<ArrowUpRight size={18} /></a>}</div></div><MediaGallery media={project.media} /></div>;
}

export function Projects({ projects, demonstration = false, initialFormat }: { projects: Project[]; demonstration?: boolean; initialFormat?: ProjectFormat }) {
  const [category, setCategory] = useState<ProjectCollectionKey>(initialFormat || "All");
  const [selected, setSelected] = useState<string | null>(projects[0]?.id ?? null);
  const [opened, setOpened] = useState<Project | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const restoreId = useRef("");
  const openFrames = useRef<number[]>([]);
  const cancelOpen = useCallback(() => { openFrames.current.forEach(cancelAnimationFrame); openFrames.current = []; }, []);
  useEffect(() => cancelOpen, [cancelOpen]);
  const reduced = useReducedMotion();
  const close = useCallback(() => {
    cancelOpen();
    if (canvas.current && canvas.current.getBoundingClientRect().top < -40) canvas.current.scrollIntoView({ block: "start", behavior: "instant" });
    setOpened(null);
    requestAnimationFrame(() => {
      const target = trigger.current?.isConnected ? trigger.current : canvas.current?.querySelector<HTMLElement>(`[data-restore-id="${CSS.escape(restoreId.current)}"]`);
      target?.focus({ preventScroll: true });
    });
  }, [cancelOpen]);
  useEffect(() => {
    if (!opened) return;
    const tick = requestAnimationFrame(() => panel.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true }));
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector('[role="dialog"][aria-modal="true"]')) { e.preventDefault(); close(); }
    };
    document.addEventListener("keydown", escape);
    return () => { cancelAnimationFrame(tick); document.removeEventListener("keydown", escape); };
  }, [opened, close]);
  const list = projects.filter(p => category === "All" || projectFormat(p) === category);
  const preview = list.find(p => p.id === selected) || list[0];
  const transition = { duration: reduced ? 0 : 0.78, ease: [0.22, 1, 0.36, 1] as const };
  const openProject = (project: Project, element: HTMLElement) => {
    cancelOpen();
    trigger.current = element;
    restoreId.current = element.dataset.restoreId || "";
    if (preview?.id === project.id) { setOpened(project); return; }
    setSelected(project.id);
    openFrames.current.push(requestAnimationFrame(() => {
      openFrames.current.push(requestAnimationFrame(() => { openFrames.current = []; setOpened(project); }));
    }));
  };
  const selectCollection = (key: ProjectCollectionKey) => { cancelOpen(); setOpened(null); setCategory(key); setSelected(projects.find(project => key === "All" || projectFormat(project) === key)?.id || null); };
  return <LayoutGroup id={demonstration ? "preview-projects" : "projects"}>
    <ProjectCollections projects={projects} active={category} onSelect={selectCollection} opened={!!opened} collectionPage={!!initialFormat} />
    <div className={`project-canvas ${opened ? "is-open" : ""} ${!list.length ? "is-empty" : ""}`} ref={canvas} data-animation="projects-showcase">
      {!opened && !list.length && <div className="empty-projects"><p>{projects.length ? "New work in this collection is on its way." : "New work is on its way."}</p><Link href="/contact" className="text-link">Discuss your project<ArrowUpRight size={18} /></Link></div>}
      {!opened && !!list.length && <div className="project-index-view">
        {preview && <div className="project-preview-space"><motion.button className="project-preview" data-restore-id={`cover-${preview.id}`} onClick={e => openProject(preview, e.currentTarget)} aria-label={`Open ${preview.title}`} layoutId={`cover-${preview.id}`} transition={transition}><img src={preview.cover_url!} alt={`${preview.title} cover`} loading="lazy" /><span className="preview-arrow"><ArrowUpRight /></span></motion.button><span className="preview-caption">{preview.category}<span>↙ Choose a project</span></span></div>}
        <div className="project-list">{list.length ? list.map((p, i) => <button key={p.id} data-restore-id={`row-${p.id}`} className={`project-row ${p.id === preview?.id ? "active" : ""}`} onPointerEnter={e => { if (e.pointerType !== "touch") setSelected(p.id); }} onFocus={() => setSelected(p.id)} onClick={e => openProject(p, e.currentTarget)}><span className="project-index">{String(i + 1).padStart(2, "0")}</span><span><motion.span className="project-title display" layoutId={`title-${p.id}`} transition={transition}>{p.title}</motion.span><small>{p.category}{p.is_demo ? " · SAMPLE" : ""}</small></span><ArrowUpRight size={23} /></button>) : <p className="no-category">No projects in this category yet.</p>}</div>
        <span className="canvas-watermark display" aria-hidden="true">SELECTED / WORK</span>
      </div>}
      <AnimatePresence initial={false}>{opened && <motion.div className="project-open-panel" role="region" aria-labelledby="project-inline-title" ref={panel} key={opened.id} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.18 }}>
        <div className="project-detail-top"><button className="text-link" onClick={close}><ArrowLeft size={18} />Back to projects</button>{!demonstration && <Link href={`/projects/${opened.slug}`} className="project-permalink">Open page<ArrowUpRight size={15} /></Link>}{demonstration && <span className="eyebrow">DESIGN DEMO</span>}</div>
        <motion.h3 id="project-inline-title" className="display project-inline-title" layoutId={`title-${opened.id}`} transition={transition}>{opened.title}</motion.h3>
        <motion.div className="project-inline-cover" layoutId={`cover-${opened.id}`} transition={transition}><img src={opened.cover_url!} alt={`${opened.title} cover`} /></motion.div>
        <motion.div className="project-inline-body" initial={{ opacity: 0, y: reduced ? 0 : 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.58 }}><ProjectBody project={opened} /><button className="text-link project-back-bottom" onClick={close}><ArrowLeft size={18} />Back to projects</button></motion.div>
      </motion.div>}</AnimatePresence>
    </div>
  </LayoutGroup>;
}

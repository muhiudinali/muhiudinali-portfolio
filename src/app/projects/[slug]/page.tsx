import { notFound } from "next/navigation";
import Link from "@/components/page-link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getPortfolio } from "@/lib/data";
import { collectionPath, collections, projectFormat } from "@/lib/collections";
import { SiteShell, NextStep } from "@/components/site-shell";
import { ProjectBody } from "@/components/projects";
import { ScrollLayer, ScrollScene } from "@/components/scroll-scene";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const { slug } = await params; const { projects } = await getPortfolio(); const p = projects.find(p => p.slug === slug);
 return p ? { title: p.title, description: p.summary, ...(p.is_demo ? { robots: { index: false, follow: false } } : {}) } : { title: "Project not found" };
}
export default async function ProjectPage({ params }: Props) {
 const { slug } = await params; const data = await getPortfolio(); const project = data.projects.find(p => p.slug === slug); if (!project) notFound();
 const c = collections.find(c => c.format === projectFormat(project))!;
 return <SiteShell data={data}><ScrollScene className="standalone-project" id="top"><div className="project-direct-nav"><Link href="/projects" className="text-link"><ArrowLeft size={18} />Back to projects</Link><Link href={collectionPath(c.format)} className="text-link">{c.label}<ArrowUpRight size={18} /></Link></div><div className="project-direct-stage"><ScrollLayer distance={180} tilt={5} dim><h1 className="display project-detail-title">{project.title}</h1></ScrollLayer><ScrollLayer className="project-detail-cover" distance={-65}><img src={project.cover_url!} alt={`${project.title} cover`} /></ScrollLayer></div><ProjectBody project={project} /><Link className="text-link project-back-bottom" href={collectionPath(c.format)}><ArrowLeft size={18} />Back to {c.label}</Link></ScrollScene><NextStep title="YOUR PROJECT, NEXT." /></SiteShell>;
}

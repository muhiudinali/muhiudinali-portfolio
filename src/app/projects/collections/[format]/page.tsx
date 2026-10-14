import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPortfolio } from "@/lib/data";
import { collections, projectFormat } from "@/lib/collections";
import { SiteShell, PageIntro, NextStep } from "@/components/site-shell";
import { ScrollLayer, ScrollScene } from "@/components/scroll-scene";
import { CollectionGallery } from "@/components/collection-gallery";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ format: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const { format } = await params; const c = collections.find(c => c.format === format);
 return c ? { title: c.label, description: c.description } : { title: "Collection not found" };
}
export default async function CollectionPage({ params }: Props) {
 const { format } = await params; const c = collections.find(c => c.format === format); if (!c) notFound();
 const data = await getPortfolio(); const projects = data.projects.filter(p => projectFormat(p) === c.format);
 return <SiteShell data={data}><PageIntro name={data.profile.name} eyebrow="MY PROJECTS / COLLECTION" title={c.title} description={c.description} /><ScrollScene className="collection-showcase section-pad"><ScrollLayer distance={90}><div className="section-kicker"><span>{c.label.toUpperCase()} / EXPLORE THE WORK</span><span>{projects.length} PROJECTS</span></div></ScrollLayer><CollectionGallery key={c.format} projects={data.projects} format={c.format} /></ScrollScene><NextStep /></SiteShell>;
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPortfolio } from "@/lib/data";
import { serviceSlug } from "@/lib/collections";
import { SiteShell, PageIntro, NextStep } from "@/components/site-shell";
import { SkillsSection } from "@/components/portfolio";
import { ServiceDetail } from "@/components/service-content";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const { slug } = await params; const data = await getPortfolio(); const s = data.services.find(s => serviceSlug(s) === slug);
 return s ? { title: s.title, description: s.description } : { title: "Service not found" };
}
export default async function ServicePage({ params }: Props) {
 const { slug } = await params; const data = await getPortfolio(); const service = data.services.find(s => serviceSlug(s) === slug); if (!service) notFound();
 return <SiteShell data={data}><PageIntro name={data.profile.name} eyebrow="SERVICE / THE DETAILS" title={service.title.toUpperCase()} description={service.description} /><ServiceDetail service={service} /><SkillsSection data={data} /><NextStep title="LET’S WORK TOGETHER." /></SiteShell>;
}

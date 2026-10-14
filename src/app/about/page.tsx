import Link from "@/components/page-link";
import { ArrowUpRight } from "lucide-react";
import { getPortfolio } from "@/lib/data";
import { SiteShell, PageIntro, NextStep } from "@/components/site-shell";
import { AboutSection, ApproachSection, JourneySection } from "@/components/portfolio";
export const dynamic = "force-dynamic";
export const metadata = { title: "About" };
export default async function AboutPage() {
 const data = await getPortfolio();
 return <SiteShell data={data}><PageIntro name={data.profile.name} eyebrow="01 / ABOUT ME" title="THE PERSON." accent="THE PURPOSE." description={data.profile.headline} /><AboutSection data={data} /><ApproachSection data={data} /><JourneySection data={data} /><div className="page-more"><Link className="text-link" href="/journey">Explore the full journey<ArrowUpRight size={18} /></Link></div><NextStep /></SiteShell>;
}

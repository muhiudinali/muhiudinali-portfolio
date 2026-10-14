import { getPortfolio } from "@/lib/data";
import { SiteShell, PageIntro, NextStep } from "@/components/site-shell";
import { SkillsSection, ApproachSection } from "@/components/portfolio";
import { ServiceList } from "@/components/service-content";
export const dynamic = "force-dynamic";
export const metadata = { title: "Services" };
export default async function ServicesPage() {
 const data = await getPortfolio();
 return <SiteShell data={data}><PageIntro name={data.profile.name} eyebrow="SERVICES / WHAT I CAN HELP WITH" title="CREATE." accent="STRATEGIZE. BUILD." description="Explore the creative, marketing and development work I bring together." /><SkillsSection data={data} /><ServiceList data={data} /><ApproachSection data={data} /><NextStep title="YOUR NEXT IDEA." /></SiteShell>;
}

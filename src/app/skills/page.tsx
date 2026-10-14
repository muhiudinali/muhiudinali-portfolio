import { getPortfolio } from "@/lib/data";
import { SiteShell, PageIntro, NextStep } from "@/components/site-shell";
import { SkillsSection, VideoAdsSection } from "@/components/portfolio";
import { SkillInventory, ServiceList } from "@/components/service-content";
export const dynamic = "force-dynamic";
export const metadata = { title: "Skills" };
export default async function SkillsPage() {
 const data = await getPortfolio();
 return <SiteShell data={data}><PageIntro name={data.profile.name} eyebrow="02 / SKILLS" title="CREATIVE SKILLS." accent="PRACTICAL EXECUTION." description="AI content creation, performance marketing and web & app development—with the design, marketing and development skills behind the work." /><SkillsSection data={data} /><SkillInventory skills={data.skills} services={data.services} /><ServiceList data={data} /><VideoAdsSection data={data} /><NextStep title="LET’S MAKE IT REAL." /></SiteShell>;
}

import { getPortfolio } from "@/lib/data";
import { SiteShell, PageIntro, NextStep } from "@/components/site-shell";
import { JourneySection } from "@/components/portfolio";
import { SkillInventory } from "@/components/service-content";
export const dynamic = "force-dynamic";
export const metadata = { title: "My Journey" };
export default async function JourneyPage() {
 const data=await getPortfolio();
 return <SiteShell data={data}><PageIntro name={data.profile.name} eyebrow="04 / EXPERIENCE & EDUCATION" title="ALWAYS LEARNING." accent="ALWAYS BUILDING." description="My experience, education and the skills that connect them." /><JourneySection data={data} /><SkillInventory skills={data.skills} services={data.services} /><NextStep /></SiteShell>;
}

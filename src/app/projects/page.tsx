import { getPortfolio } from "@/lib/data";
import { SiteShell, NextStep } from "@/components/site-shell";
import { WorkSection } from "@/components/portfolio";
export const dynamic = "force-dynamic";
export const metadata = { title: "My Projects" };
export default async function ProjectsPage() {
 const data = await getPortfolio();
 return <SiteShell data={data}><h1 className="sr-only">My Projects</h1><div id="top" /><WorkSection data={data} showcase /><NextStep /></SiteShell>;
}

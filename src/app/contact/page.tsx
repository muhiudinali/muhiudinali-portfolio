import { getPortfolio } from "@/lib/data";
import { SiteShell } from "@/components/site-shell";
import { ContactSection } from "@/components/portfolio";
export const dynamic = "force-dynamic";
export const metadata = { title: "Let’s Connect" };
export default async function ContactPage() {
 const data=await getPortfolio();
 return <SiteShell data={data}><h1 className="sr-only">Let’s connect with {data.profile.name}</h1><div id="top" /><ContactSection data={data} /></SiteShell>;
}

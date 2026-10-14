import { getPortfolio } from "@/lib/data";
import { Portfolio } from "@/components/portfolio";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { profile, services } = await getPortfolio();
  return { title: `${profile.name} · Creative Portfolio`, description: `${profile.name} — ${services.map(s => s.title).join(", ")}. ${profile.location}.` };
}
export default async function Home() { return <Portfolio data={await getPortfolio()} />; }

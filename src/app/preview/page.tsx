import type { Metadata } from "next";
import { getPortfolio } from "@/lib/data";
import { previewProjects } from "@/lib/preview";
import { Portfolio } from "@/components/portfolio";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Design & Motion Preview", robots: { index: false, follow: false } };
export default async function PreviewPage() {
  const data = await getPortfolio();
  return <Portfolio data={{ ...data, projects: previewProjects }} demonstration />;
}

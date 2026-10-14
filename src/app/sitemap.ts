import type { MetadataRoute } from "next";
import { getPortfolio } from "@/lib/data";
import { collectionPath, collections, servicePath } from "@/lib/collections";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const base=process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/,""); if(!base) return [];
 const { projects, services }=await getPortfolio();
 const pages=["/","/about","/skills","/services","/projects","/journey","/contact",...collections.map(c=>collectionPath(c.format)),...services.map(servicePath)];
 return [...pages.map(p=>({url:base+(p==="/"?"":p),changeFrequency:"weekly" as const,priority:p==="/"?1:0.7})),...projects.filter(p=>!p.is_demo).map(p=>({url:`${base}/projects/${p.slug}`,lastModified:p.updated_at?new Date(p.updated_at):undefined,priority:0.7}))];
}

import Link from "@/components/page-link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { PortfolioData } from "@/lib/types";
import { Navbar } from "./navbar";
import { EntryLoader } from "./motion";
import { ScrollScene, ScrollLayer } from "./scroll-scene";

export function SiteShell({ data, children, demonstration = false }: { data: PortfolioData; children: ReactNode; demonstration?: boolean }) {
  const { profile, socials } = data;
  return <>
    <EntryLoader portrait={profile.portrait_url} name={profile.name} />
    {demonstration && <div className="preview-banner"><strong>PREVIEW</strong><span>Sample work</span><Link href="/skills">Explore skills<ArrowUpRight size={15} /></Link></div>}
    <Navbar name={profile.name} home={demonstration ? "/preview" : "/"} />
    <main id="main" tabIndex={-1}>{children}</main>
    <footer className="site-footer"><Link className="brand" href="/">{profile.name.toUpperCase()}<span>↗</span></Link><div className="footer-socials">{socials.map(s => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">{s.label}<ArrowUpRight size={14} /></a>)}</div><small>© {new Date().getFullYear()} {profile.name}</small></footer>
  </>;
}

export function PageIntro({ name, eyebrow, title, accent, description }: { name: string; eyebrow: string; title: string; accent?: string; description?: string }) {
  return <ScrollScene className="page-intro section-pad" id="top"><div className="section-kicker"><span>{eyebrow}</span><span>{name.toUpperCase()} / CREATIVE PORTFOLIO</span></div><ScrollLayer distance={200} tilt={7} dim><h1 className="display page-title">{title}{accent && <><br /><span className="outline-text">{accent}</span></>}</h1></ScrollLayer>{description && <ScrollLayer distance={55} className="page-intro-copy"><p>{description}</p><span aria-hidden="true">↙ SCROLL TO EXPLORE</span></ScrollLayer>}</ScrollScene>;
}

export function NextStep({ title = "HAVE AN IDEA?", description = "Let’s connect the creative thinking and the execution." }: { title?: string; description?: string }) {
  return <ScrollScene className="next-step section-pad"><ScrollLayer distance={150} tilt={4}><h2 className="display">{title}</h2><div><p>{description}</p><Link className="button yellow" href="/contact">LET’S TALK<ArrowUpRight size={18} /></Link></div></ScrollLayer></ScrollScene>;
}

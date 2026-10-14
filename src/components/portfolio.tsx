import Link from "@/components/page-link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { phoneHref } from "@/lib/validation";
import type { PortfolioData } from "@/lib/types";
import { Hero } from "./hero";
import { DisciplineRibbon } from "./discipline-ribbon";
import { Skills } from "./skills";
import { SkillInventory } from "./service-content";
import { contactPlatforms, socialLogo } from "@/lib/contact-platforms";
import { Projects } from "./projects";
import { ProjectIndex } from "./project-index";
import { CollectionGallery } from "./collection-gallery";
import { CursorTrail } from "./motion";
import { ScrollLayer, ScrollScene } from "./scroll-scene";
import { SiteShell } from "./site-shell";

export function AboutSection({ data }: { data: PortfolioData }) { const { profile, services } = data; return <ScrollScene id="about" className="about section-pad">
        <div className="section-kicker"><span>01 / THE PERSON BEHIND THE WORK</span><span>{profile.location.toUpperCase()}</span></div>
        <div className="about-board">
          <ScrollLayer className="about-oversize display" distance={200} tilt={6} dim><span aria-hidden="true">ABOUT<br /><span className="outline-text">ME.</span></span></ScrollLayer>
          <ScrollLayer className="about-portrait-layer" distance={-65}><div className="about-halo" aria-hidden="true" /><img src={profile.portrait_url} alt={profile.name} width={941} height={1672} loading="lazy" /><span className="portrait-caption">THE CREATIVE MIND<br />BEHIND THE PIXELS.</span></ScrollLayer>
          <ScrollLayer className="about-copy" distance={90} tilt={2}><p className="eyebrow">HELLO AGAIN, I’M</p><h2 className="display about-name">{profile.name.toUpperCase()}<span>.</span></h2><h3>{profile.headline}</h3>{profile.about.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}<div className="about-disciplines">{services.slice(0, 3).map((s, i) => <span key={s.id}><b>0{i + 1}</b>{s.title}</span>)}</div><Link className="text-link" href="/contact">Let’s bring your idea to life<ArrowUpRight size={20} /></Link></ScrollLayer>
          <div className="board-bottom"><span>IDEAS INTO SOMETHING REAL.</span><span>✳</span><span>AI + MARKETING + DEVELOPMENT</span></div>
        </div>
      </ScrollScene>; }

export function SkillsSection({ data }: { data: PortfolioData }) { const { services } = data; return <ScrollScene id="skills" className="skills section-pad"><ScrollLayer distance={140} tilt={3} dim><Skills services={services} /></ScrollLayer></ScrollScene>; }

export function ApproachSection({ data }: { data: PortfolioData }) { const { services } = data; return <ScrollScene className="approach section-pad">
        <div className="section-kicker"><span>THE WAY I THINK</span><span>CREATIVITY BACKED BY STRATEGY.</span></div>
        <div className="approach-stage">
          <ScrollLayer className="approach-art" distance={-85}><img src="/assets/photography/development.png" alt="" loading="lazy" /><img src="/assets/photography/marketing.png" alt="" loading="lazy" /><img src="/assets/photography/creative.png" alt="" loading="lazy" /></ScrollLayer>
          <ScrollLayer className="approach-type" distance={230} tilt={5} dim><h2 className="display">IDEAS THAT<br /><span className="outline-text">CONNECT.</span></h2></ScrollLayer>
          <ScrollLayer className="approach-copy" distance={60}><span className="asterisk" aria-hidden="true">✳</span><p>From a creative concept to a campaign to a working product, I bring the pieces together.</p><Link href="/skills" className="text-link">Explore my skills<ArrowUpRight size={20} /></Link></ScrollLayer>
        </div>
        <div className="approach-steps">{services.slice(0, 3).map((s, i) => <div key={s.id}><span className="eyebrow">0{i + 1} / {["CREATE", "STRATEGIZE", "BUILD"][i]}</span><h3>{s.title}</h3><p>{s.tags.join(" · ")}</p></div>)}</div>
      </ScrollScene>; }

export function WorkSection({ data, demonstration = false, showcase = false }: { data: PortfolioData; demonstration?: boolean; showcase?: boolean }) { const { projects } = data; return <ScrollScene id="work" className="work section-pad">
        <div className="section-kicker"><span>03 / MY PROJECTS</span><span>CREATIVE WORK. DIGITAL EXPERIENCES.</span></div>
        <ScrollLayer className="work-heading" distance={160} tilt={5} dim><h2 className="display">SELECTED<br /><span className="outline-text">WORK.</span></h2><p>Creative collections.<br />The thinking behind the work.<span>↙ Explore a project</span></p></ScrollLayer>
        {showcase ? <Projects projects={projects} demonstration={demonstration} /> : <ProjectIndex projects={projects} />}
      </ScrollScene>; }

export function VideoAdsSection({ data }: { data: PortfolioData }) {
  return <ScrollScene id="video-ads" className="skill-work section-pad">
    <div className="section-kicker"><span>MY SKILLS / VIDEO ADS</span><span>EXPLORE THE COLLECTION</span></div>
    <ScrollLayer className="skill-work-heading" distance={130} tilt={3}><h2 className="display">VIDEO ADS.</h2><p>Explore my motion creatives and video collections. Select a poster to expand it, then press play.</p></ScrollLayer>
    <CollectionGallery projects={data.projects} format="video-ads" />
  </ScrollScene>;
}

export function JourneySection({ data }: { data: PortfolioData }) { const { experience, education } = data; return <ScrollScene id="journey" className="experience section-pad">
        <div className="section-kicker"><span>04 / MY JOURNEY</span><span>LEARN. CREATE. KEEP BUILDING.</span></div>
        <div className="journey-grid">
          <div className="journey-visual"><ScrollLayer className="journey-title" distance={180} tilt={4} dim><h2 className="display">FROM<br /><span className="outline-text">LEARNING.</span><br />TO BUILDING.</h2></ScrollLayer><ScrollLayer className="journey-art" distance={-70}><img src="/assets/photography/branding.png" alt="" loading="lazy" /><img src="/assets/photography/development.png" alt="" loading="lazy" /><span className="journey-seal">LEARN<br />CREATE<br />BUILD ↗</span></ScrollLayer></div>
          <ScrollLayer className="journey-content" distance={65}><p className="eyebrow">THE EXPERIENCE</p>{experience.map((e, i) => <article className="experience-row" key={e.id}><span className="timeline-dot" aria-hidden="true">0{i + 1}</span><span className="experience-duration">{e.duration}</span><h3>{e.role}</h3><p className="company">{e.company}</p><p className="experience-description">{e.description}</p></article>)}<p className="eyebrow education-label">THE FOUNDATION</p><div className="education-grid">{education.map(e => <div key={e.id}><h4>{e.qualification}</h4><p>{e.status}</p></div>)}</div><div className="language-row"><span>Urdu & Punjabi · Fluent</span><span>English · Professional working</span></div></ScrollLayer>
        </div>
      </ScrollScene>; }

export function ContactSection({ data }: { data: PortfolioData }) { const { profile, socials } = data; const platforms = contactPlatforms(profile, socials); return <ScrollScene id="contact" className="contact">
        <CursorTrail platforms={platforms}>
          <div className="section-kicker"><span>05 / LET’S MAKE IT HAPPEN</span><span>{profile.location.toUpperCase()}</span></div>
          <div className="contact-stage">
            <ScrollLayer className="contact-heading-layer" distance={140} tilt={4}><h2 className="display contact-heading">LET’S<br /><span className="outline-text">BUILD</span><br />SOMETHING<br /><span>GREAT.</span></h2><p>Have an idea, a project or a creative challenge?<br />Let’s turn it into something worth sharing.</p></ScrollLayer>
            <ScrollLayer className="contact-portrait" distance={-45}><div className="contact-orbit" aria-hidden="true" /><img src={profile.portrait_url} alt="" width={941} height={1672} loading="lazy" /></ScrollLayer>
            <ScrollLayer className="contact-card" distance={80}><span className="contact-card-star" aria-hidden="true">✳</span><p className="eyebrow">START A CONVERSATION</p><h3 className="display">{profile.name.toUpperCase()}</h3><div className="contact-links"><a href={`mailto:${profile.email}`}><Mail size={18} /><span>{profile.email}</span><ArrowUpRight size={18} /></a><a href={phoneHref(profile.phone)}><Phone size={18} /><span>{profile.phone}</span><ArrowUpRight size={18} /></a></div><div className="contact-socials">{socials.map(s => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">{socialLogo(s) && <img className="contact-platform-mark" src={socialLogo(s)!} alt="" width={17} height={17} />}<span>{s.label}</span><ArrowUpRight size={14} /></a>)}</div><span className="eyebrow contact-location">{profile.location}</span></ScrollLayer>
          </div>
          <div className="contact-signoff"><span>EVERY IDEA STARTS WITH A CONVERSATION.</span><span>LET’S CREATE YOURS. ↗</span></div>
        </CursorTrail>
      </ScrollScene>; }

export function Portfolio({ data, demonstration = false }: { data: PortfolioData; demonstration?: boolean }) {
 return <SiteShell data={data} demonstration={demonstration}>
  <Hero profile={data.profile} services={data.services} socials={data.socials} />
  <AboutSection data={data} />
  <DisciplineRibbon services={data.services} />
  <SkillsSection data={data} /><SkillInventory skills={data.skills} services={data.services} /><ApproachSection data={data} />
  <WorkSection data={data} demonstration={demonstration} />
  <JourneySection data={data} /><ContactSection data={data} />
 </SiteShell>;
}

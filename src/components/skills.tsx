"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import type { Service } from "@/lib/types";
import Link from "@/components/page-link";
import { servicePath } from "@/lib/collections";

const artworks = { sparkles: "/assets/photography/creative.png", chart: "/assets/photography/marketing.png", code: "/assets/photography/development.png" };

export function Skills({ services }: { services: Service[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [tapped, setTapped] = useState(false);
  const group = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const service = active === null ? null : services[active];
  const title = service?.title.toUpperCase() || "MY SKILLS";
  const restore = () => { if (!tapped && !group.current?.contains(document.activeElement)) setActive(null); };
  return <div className="skills-inner">
    <div className="section-kicker"><span>02 / WHAT I DO</span><span>CREATE. STRATEGIZE. BUILD.</span></div>
    <p className="skills-prompt">Three disciplines. One creative mind.<span>Choose a discipline ↙</span></p>
    <div className="skills-selectors" ref={group} onPointerLeave={restore} onBlur={e => { if (!tapped && !e.currentTarget.contains(e.relatedTarget)) setActive(null); }}>
      {services.map((s, i) => <button key={s.id} className={`skills-selector ${i === active ? "active" : ""}`} onPointerEnter={e => { if (e.pointerType !== "touch") { setTapped(false); setActive(i); } }} onPointerDown={e => setTapped(e.pointerType === "touch")} onFocus={() => setActive(i)} onClick={() => setActive(i)} aria-label={s.title} aria-pressed={i === active} aria-controls="skills-description">
        <motion.span className="skills-thumb" animate={{ width: i === active ? 104 : 58, height: i === active ? 104 : 58, y: i === active ? -18 : 0 }} transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}><img src={artworks[s.icon] || artworks.sparkles} alt="" width={640} height={800} /><AnimatePresence>{i === active && <motion.span className="skills-arrow" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><ArrowUpRight size={25} /></motion.span>}</AnimatePresence></motion.span><span className="skills-selector-label">{s.title}</span>
      </button>)}
    </div>
    <div className="skills-heading-wrap" aria-hidden="true"><AnimatePresence initial={false} mode="sync"><motion.div className={`display skills-heading ${service ? "active" : ""}`} key={title} initial="enter" animate="show" exit="leave">
      {title.split(" ").map((word, wi) => <span className="skills-word" key={`${word}-${wi}`}>{Array.from(word).map((letter, i) => <motion.span className="skills-letter" key={i} variants={{ enter: { y: "105%", scaleY: 0.15, opacity: 0 }, show: { y: "0%", scaleY: 1, opacity: 1 }, leave: { y: "-105%", scaleY: 0.1, opacity: 0 } }} transition={{ duration: reduced ? 0 : 0.48, delay: reduced ? 0 : (i + wi * 3) * 0.018, ease: [0.22, 1, 0.36, 1] }}>{letter}</motion.span>)}</span>)}
    </motion.div></AnimatePresence></div>
    <h2 className="sr-only">My skills</h2>
    <div className="skills-description" id="skills-description" aria-live="polite"><div><p>{service?.description || "Content that tells a story. Marketing that reaches the right people. Digital products that turn ideas into experiences."}</p><Link className="text-link skills-detail-link" href={service ? servicePath(service) : "/services"}>{service ? "Explore this service" : "Explore all services"}<ArrowUpRight size={18} /></Link></div><div className="tag-list">{(service?.tags || ["AI & Creative", "Performance Marketing", "Web & App"]).map(tag => <span key={tag}>{tag}</span>)}</div></div>
    <nav className="skills-work-links" aria-label="Explore skill work"><Link href="/projects/collections/image-ads">IMAGE ADS<ArrowUpRight size={15} /></Link><Link href="/skills#video-ads">VIDEO ADS<ArrowUpRight size={15} /></Link><Link href="/projects/collections/web-apps">WEB & APP<ArrowUpRight size={15} /></Link></nav>
  </div>;
}

"use client";
import Link from "@/components/page-link";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import type { Profile, Service, Social } from "@/lib/types";

export function Hero({ profile, services, socials }: { profile: Profile; services: Service[]; socials: Social[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const settled = useSpring(scrollYProgress, { stiffness: 110, damping: 29, mass: 0.55 });
  const textY = useTransform(settled, [0, 1], [0, -340]);
  const portraitY = useTransform(settled, [0, 1], [0, 100]);
  const skew = useTransform(settled, [0, 0.85], [0, -9]);
  const opacity = useTransform(settled, [0, 0.65, 1], [1, 0.5, 0.08]);
  const reduced = useReducedMotion();
  const inView = useInView(ref);
  const parts = profile.name.trim().split(/\s+/); const surname = parts.pop() || "Ali"; const given = parts.join(" ") || profile.name;
  return <section className="hero" ref={ref} id="top">
    <div className="hero-stage">
      <motion.div className="hero-word display" aria-hidden="true" style={reduced ? {} : { y: textY, skewY: skew, opacity }}>PORTFOLIO</motion.div>
      <motion.div className="hero-orbits" data-running={inView && !reduced} style={reduced ? {} : { y: portraitY }} aria-hidden="true"><div className="sun-disc" /><span className="orbit orbit-one"><i className="orbit-particle" /></span><span className="orbit orbit-two"><i className="orbit-particle" /></span></motion.div>
      <motion.div className="hero-portrait-layer" style={reduced ? {} : { y: portraitY }}><img className="hero-portrait" src={profile.portrait_url} alt={profile.name} width={941} height={1672} fetchPriority="high" /></motion.div>
      <motion.div className="hero-intro" style={reduced ? {} : { y: textY, skewY: skew, opacity }}>
        <div className="hero-kicker-row">
          <p className="eyebrow hero-greeting">HELLO, I’M</p>
          <a href="https://developerstech.netlify.app" target="_blank" rel="noopener noreferrer" className="hero-agency-pill" title="Co-Founder of Developers Tech">
            <span className="pill-dot" />
            <span>CO-FOUNDER @ DEVELOPERS TECH ↗</span>
          </a>
        </div>
        <h1 className="editorial hero-name"><span>{given.toUpperCase()}</span><span>{surname.toUpperCase()}<i>.</i></span></h1>
        <ul className="hero-roles">{services.slice(0, 3).map(s => <li key={s.id}>{s.title}</li>)}</ul>
        <div className="hero-actions"><Link className="button blue" href="/projects">VIEW MY WORK<ArrowUpRight size={18} /></Link><Link className="button yellow" href="/contact">LET’S TALK<ArrowUpRight size={18} /></Link></div>
      </motion.div>
      <div className="hero-aside"><span className="small-star">✳</span><span>AI <i>+</i><br />ADS <i>+</i><br />CODE</span><p>One creative mind.<br />Many ways to build.</p></div>
      <span className="hero-edition" aria-hidden="true">CREATIVE / DIGITAL / PORTFOLIO</span>
    </div>
    <div className="hero-footer"><span className="location"><i />{profile.location}</span><div className="hero-socials">{socials.map(s => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">{s.label}<ArrowUpRight size={12} /></a>)}</div><a href="#about" className="scroll-cue">SCROLL TO EXPLORE<ArrowDown size={18} /></a></div>
  </section>;
}

"use client";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { ContactPlatform } from "@/lib/contact-platforms";
import { lockDocumentScroll } from "@/lib/scroll-lock";

const useEntryEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
let documentIntroComplete = false;

// A04: one entry loader, mirrored column halves, opening left to right.
export function EntryLoader({ portrait, name }: { portrait: string; name: string }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"intro" | "opening" | "done">("intro");
  useEntryEffect(() => {
    if (documentIntroComplete) { setPhase("done"); return; }
    setPhase("intro");
    let cancelled = false;
    let start: ReturnType<typeof setTimeout> | undefined;
    let finish: ReturnType<typeof setTimeout> | undefined;
    let capTimer: ReturnType<typeof setTimeout> | undefined;
    const releaseScroll = lockDocumentScroll(document);
    const image = new Image(); image.src = portrait;
    const ready = new Promise<void>(resolve => { image.onload = () => resolve(); image.onerror = () => resolve(); if (image.complete) resolve(); });
    const minimum = new Promise<void>(resolve => { start = setTimeout(resolve, reduced ? 80 : 1450); });
    const cap = new Promise<void>(resolve => { capTimer = setTimeout(resolve, 2400); });
    Promise.race([Promise.all([ready, minimum]), cap]).then(() => {
      if (cancelled) return;
      clearTimeout(capTimer);
      documentIntroComplete = true;
      setPhase("opening");
      releaseScroll();
      finish = setTimeout(() => { if (!cancelled) setPhase("done"); }, reduced ? 180 : 1050);
    });
    return () => { cancelled = true; clearTimeout(start); clearTimeout(finish); clearTimeout(capTimer); image.onload = null; image.onerror = null; releaseScroll(); };
  }, [portrait, reduced]);
  if (phase === "done") return null;
  return <div className={`entry-loader ${phase}`} aria-hidden="true">
    {Array.from({ length: 8 }, (_, i) => <div className="loader-column" key={i}>
      <motion.div className="loader-half top" initial={{ y: "0%" }} animate={{ y: phase === "opening" ? "-105%" : "0%" }} transition={{ duration: reduced ? 0.12 : 0.64, delay: reduced ? 0 : i * 0.045, ease: [0.76, 0, 0.24, 1] }} />
      <motion.div className="loader-half bottom" initial={{ y: "0%" }} animate={{ y: phase === "opening" ? "105%" : "0%" }} transition={{ duration: reduced ? 0.12 : 0.64, delay: reduced ? 0 : i * 0.045, ease: [0.76, 0, 0.24, 1] }} />
    </div>)}
    <motion.span className="loader-name" initial={{ opacity: 0 }} animate={{ opacity: phase === "intro" ? 1 : 0 }} transition={{ duration: 0.3 }}>{name}<span>CREATIVE · MARKETING · DEVELOPMENT</span></motion.span>
  </div>;
}

export function CursorTrail({ platforms, children }: { platforms: ContactPlatform[]; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [stamps, setStamps] = useState<{ id: number; x: number; y: number; logo: string; label: string; rotation: number }[]>([]);
  const last = useRef({ x: -10000, y: -10000 });
  const counter = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const change = () => setEnabled(media.matches);
    change(); media.addEventListener("change", change);
    return () => { media.removeEventListener("change", change); timers.current.forEach(clearTimeout); };
  }, []);
  useEffect(() => { if (!visible || !enabled || reduced) { timers.current.forEach(clearTimeout); timers.current = []; setStamps([]); last.current = { x: -10000, y: -10000 }; } }, [visible, enabled, reduced]);
  return <div ref={ref} className="contact-trail" onPointerMove={event => {
    if (!enabled || reduced || !visible || !platforms.length || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    if (Math.hypot(x - last.current.x, y - last.current.y) < 85) return;
    last.current = { x, y }; const id = ++counter.current;
    const platform = platforms[(id - 1) % platforms.length];
    setStamps(prev => [...prev.slice(-9), { id, x, y, logo: platform.logo, label: platform.label, rotation: id % 2 ? 9 : -9 }]);
    const timer = setTimeout(() => {
      setStamps(prev => prev.filter(stamp => stamp.id !== id));
      timers.current = timers.current.filter(t => t !== timer);
    }, 1200);
    timers.current.push(timer);
  }} onPointerLeave={() => { last.current = { x: -10000, y: -10000 }; }}>
    {visible && enabled && !reduced && stamps.map(stamp => <motion.span key={stamp.id} className={`trail-stamp trail-logo-stamp ${stamp.id % 2 ? "sun" : "warm"}`} aria-hidden="true" style={{ left: stamp.x, top: stamp.y, rotate: stamp.rotation }} initial={{ scale: 0 }} animate={{ scale: [0, 1, 1, 0] }} transition={{ duration: 1.15, times: [0, 0.2, 0.72, 1] }}><img src={stamp.logo} alt="" width={44} height={44} /><span>{stamp.label}</span></motion.span>)}
    <div className="contact-content">{children}</div>
    {!!platforms.length && <nav className="contact-static-platforms" aria-label="Contact platforms">{platforms.map(platform => <a key={platform.href} href={platform.href} target={platform.external ? "_blank" : undefined} rel={platform.external ? "noopener noreferrer" : undefined}><img src={platform.logo} alt="" width={28} height={28} loading="lazy" /><span>{platform.label}</span></a>)}</nav>}
  </div>;
}

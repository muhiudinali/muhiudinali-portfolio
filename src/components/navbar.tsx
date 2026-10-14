"use client";
import Link from "@/components/page-link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useDialog } from "./use-dialog";

export const navigation = [["About", "/about"], ["Skills", "/skills"], ["Services", "/services"], ["My Projects", "/projects"], ["Contact", "/contact"]];
export function Navbar({ name, home = "/" }: { name: string; home?: string }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDialog(open, ref, close);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, value => `${value * 100}%`);
  return <>
    <button className="floating-menu" aria-expanded={open} aria-controls="portfolio-menu" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(v => !v)}>{open ? <X size={24} /> : <Menu size={22} />}<motion.span className="menu-progress" style={{ height: progress }} aria-hidden="true" /></button>
    <div className="scroll-progress-rail" aria-hidden="true"><motion.span style={{ scaleY: scrollYProgress }} /></div>
    <AnimatePresence>{open && <motion.div id="portfolio-menu" className="menu-overlay" role="dialog" aria-modal="true" aria-label="Navigation" ref={ref} tabIndex={-1} initial={{ clipPath: reduced ? "none" : "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: reduced ? "none" : "inset(0 0 100% 0)", opacity: reduced ? 0 : 1 }} transition={{ duration: reduced ? 0.1 : 0.6, ease: [0.76, 0, 0.24, 1] }}>
      <div className="menu-meta"><Link href={home} onClick={close}>{name.toUpperCase()}</Link><button className="icon-button" onClick={close} aria-label="Close navigation"><X /></button></div>
      <nav aria-label="Expanded navigation">{navigation.map(([label, href], i) => <Link key={href} href={href} onClick={close} aria-current={path === href ? "page" : undefined}><small>0{i + 1}</small><span className="display">{label.toUpperCase()}</span><ArrowUpRight /></Link>)}</nav><p><Link href="/journey" onClick={close}>MY JOURNEY ↗</Link><span>AI. MARKETING. DEVELOPMENT.</span></p>
    </motion.div>}</AnimatePresence>
  </>;
}

"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Maximize2, Play, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { ProjectMedia } from "@/lib/types";
import { useDialog } from "./use-dialog";

export function MediaGallery({ media }: { media: ProjectMedia[] }) {
  const [active, setActive] = useState(() => Math.max(0, media.length - 1));
  const [opened, setOpened] = useState<ProjectMedia | null>(null);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpened(null), []);
  useDialog(!!opened, ref, close);
  if (!media.length) return null;
  return <div className="project-gallery">
    <p className="eyebrow">EXPLORE THE COLLECTION</p>
    <div className="expand-gallery">{media.map((m, i) => <motion.div key={m.id} className={`gallery-item ${active === i ? "selected" : ""}`} animate={{ flexGrow: active === i ? (media.length > 5 ? 4 : 5) : 1 }} transition={{ duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }} onPointerEnter={e => { if (e.pointerType !== "touch") setActive(i); }}>
      <button className="gallery-select" aria-label={`Select ${m.alt}`} aria-pressed={active === i} onFocus={() => setActive(i)} onClick={() => setActive(i)} onKeyDown={e => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return; e.preventDefault(); const next = e.key === "Home" ? 0 : e.key === "End" ? media.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + media.length) % media.length; const gallery = e.currentTarget.closest<HTMLElement>(".expand-gallery"); const target = gallery?.querySelectorAll<HTMLButtonElement>(".gallery-select")[next]; target?.focus({ preventScroll: true }); if (gallery && target) { const view = gallery.getBoundingClientRect(), item = target.getBoundingClientRect(); const left = item.left < view.left ? item.left - view.left : item.right > view.right ? item.right - view.right : 0; if (left) gallery.scrollBy({ left, behavior: reduced ? "instant" : "smooth" }); } }}><img src={m.kind === "video" ? m.poster_url! : m.url} alt={m.alt} loading="lazy" /><span className="gallery-label">{m.caption || m.alt}</span></button>
      {active === i && <button className="gallery-open" onClick={() => setOpened(m)} aria-label={m.kind === "video" ? `Play ${m.alt}` : `View ${m.alt}`}>{m.kind === "video" ? <Play size={20} fill="currentColor" /> : <Maximize2 size={20} />}</button>}
    </motion.div>)}</div>
    <p className="gallery-hint">Select a preview, then {media[active]?.kind === "video" ? "press play." : "open it for the full view."}</p>
    <AnimatePresence>{opened && <motion.div className="media-lightbox" role="dialog" aria-modal="true" aria-label={opened.alt} ref={ref} tabIndex={-1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
      <button className="lightbox-close" onClick={close} aria-label="Close media"><X /></button>
      <div className="lightbox-body" onClick={e => e.stopPropagation()}>{opened.kind === "video" ? <video src={opened.url} poster={opened.poster_url!} controls playsInline autoPlay aria-label={opened.alt} /> : <img src={opened.url} alt={opened.alt} />}<p>{opened.caption || opened.alt}</p></div>
    </motion.div>}</AnimatePresence>
  </div>;
}

"use client";
import { createContext, useContext, useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

const Progress = createContext<MotionValue<number> | null>(null);

/** Continuous, reversible movement tied to the section's real scroll position. */
export function ScrollScene({ children, className, id }: { children: ReactNode; className: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const settled = useSpring(scrollYProgress, { stiffness: 110, damping: 29, mass: 0.55, restDelta: 0.001 });
  return <section ref={ref} className={className} id={id}><Progress.Provider value={settled}>{children}</Progress.Provider></section>;
}

export function ScrollLayer({ children, className = "", distance = 100, tilt = 0, dim = false }: {
  children: ReactNode; className?: string; distance?: number; tilt?: number; dim?: boolean;
}) {
  const progress = useContext(Progress);
  if (!progress) throw new Error("ScrollLayer requires ScrollScene");
  return <Layer progress={progress} className={className} distance={distance} tilt={tilt} dim={dim}>{children}</Layer>;
}

function Layer({ progress, children, className, distance, tilt, dim }: {
  progress: MotionValue<number>; children: ReactNode; className: string; distance: number; tilt: number; dim: boolean;
}) {
  const reduced = useReducedMotion();
  const y = useTransform(progress, [0, 0.3, 0.58, 1], [distance, 0, -distance * 0.12, -distance]);
  const skewY = useTransform(progress, [0, 0.3, 0.65, 1], [tilt * 0.55, 0, 0, -tilt]);
  const opacity = useTransform(progress, [0, 0.2, 0.67, 1], [0.45, 1, 1, 0.12]);
  return <motion.div className={`scroll-layer ${className}`} style={reduced ? {} : { y, skewY, ...(dim ? { opacity } : {}) }}>{children}</motion.div>;
}

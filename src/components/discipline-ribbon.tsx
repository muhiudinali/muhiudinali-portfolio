"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Service } from "@/lib/types";

export function DisciplineRibbon({ services }: { services: Service[] }) {
  const visible = services.filter(service => service.enabled);
  const viewport = useRef<HTMLDivElement>(null);
  const sequence = useRef<HTMLDivElement>(null);
  const [loop, setLoop] = useState({ copies: 4, duration: 44 });

  useLayoutEffect(() => {
    const frame = viewport.current, content = sequence.current;
    if (!frame || !content) return;
    const measure = () => {
      const width = content.getBoundingClientRect().width;
      if (!width) return;
      // Overfill each identical half by one complete sequence, including after
      // font loading, resizing or shortening the service names in the editor.
      const copies = Math.ceil((frame.clientWidth + 100) / width) + 1;
      const duration = width * copies / 65;
      setLoop(previous => previous.copies === copies && Math.abs(previous.duration - duration) < 0.05 ? previous : { copies, duration });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame); observer.observe(content);
    return () => observer.disconnect();
  }, [services]);

  if (!visible.length) return null;
  const group = (copy: number) => <div className="ribbon-group" key={copy}>{Array.from({ length: loop.copies }, (_, repeat) => <div className="ribbon-sequence" key={repeat} ref={copy === 0 && repeat === 0 ? sequence : undefined}>{visible.map(service => <span className="ribbon-item" key={service.id}>{service.title.toUpperCase()}<i>✳</i></span>)}</div>)}</div>;
  return <div className="ribbon-viewport" ref={viewport} aria-hidden="true"><div className="discipline-ribbon"><div className="ribbon-track" style={{ "--ribbon-duration": `${loop.duration}s` } as CSSProperties}>{[0, 1].map(group)}</div></div></div>;
}

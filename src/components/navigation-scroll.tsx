"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { navigationKey, NavigationScrollState, type ScrollPlan } from "@/lib/navigation-scroll";

const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function NavigationScroll() {
  const pathname = usePathname() || "/";
  const search = useSearchParams().toString();
  const route = useRef({ pathname, search });
  route.current = { pathname, search };
  const state = useRef(new NavigationScrollState());
  const frame = useRef<number | null>(null);
  const entryCounter = useRef(0);
  const intent = useRef<{ kind: "link" | "history"; from: string } | null>(null);
  const apply = useRef<(plan: ScrollPlan | null) => void>(() => {});
  const commit = useRef<() => void>(() => {});

  const cancelFrame = () => { if (frame.current !== null) cancelAnimationFrame(frame.current); frame.current = null; };
  const read = () => ({ x: window.scrollX, y: window.scrollY });
  commit.current = () => {
    const destination = navigationKey(new URL(window.location.href));
    const freshEntry = intent.current?.kind === "link" && intent.current.from !== destination;
    const currentState = window.history.state && typeof window.history.state === "object" ? window.history.state : {};
    let entry = typeof currentState.portfolioScrollEntry === "string" ? currentState.portfolioScrollEntry : "";
    if (freshEntry || !entry) {
      entry = `${Date.now().toString(36)}-${++entryCounter.current}`;
      // Preserve every Next router field when adding this entry's scroll identity.
      window.history.replaceState({ ...currentState, portfolioScrollEntry: entry }, "", window.location.href);
    }
    intent.current = null;
    apply.current(state.current.commit(destination, entry));
  };
  apply.current = plan => {
    if (!plan) return;
    cancelFrame();
    const move = () => {
      const anchor = plan.kind === "anchor" ? document.getElementById(plan.id) : null;
      const position = plan.kind === "position" ? plan.position : { x: 0, y: anchor ? Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - 30) : 0 };
      window.scrollTo({ left: position.x, top: position.y, behavior: "instant" });
    };
    move();
    // One settle frame covers route DOM/layout changes. No repeated timer can
    // fight a visitor's subsequent wheel, touch or keyboard scroll.
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      move();
      if (plan.focusMain) document.querySelector<HTMLElement>('main[tabindex="-1"]')?.focus({ preventScroll: true });
      state.current.observe(read());
    });
  };

  useBeforePaint(() => {
    commit.current();
    return cancelFrame;
  }, [pathname, search]);

  useEffect(() => {
    const original = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const observe = () => state.current.observe(read());
    const click = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin || !["http:", "https:"].includes(url.protocol)) return;
      const key = navigationKey(url);
      cancelFrame();
      intent.current = { kind: "link", from: navigationKey(new URL(window.location.href)) };
      state.current.begin("link", key, read());
      if (key === navigationKey(new URL(window.location.href))) commit.current();
    };
    const pop = () => {
      const url = new URL(window.location.href);
      cancelFrame();
      intent.current = { kind: "history", from: "" };
      state.current.begin("history", navigationKey(url), read());
      // A fragment-only history move does not rerender usePathname.
      if (url.pathname === route.current.pathname && url.searchParams.toString() === route.current.search) commit.current();
    };
    const hash = () => {
      const url = new URL(window.location.href);
      if (url.pathname === route.current.pathname && url.searchParams.toString() === route.current.search) commit.current();
    };
    const interrupt = () => { cancelFrame(); observe(); };
    document.addEventListener("click", click, true);
    window.addEventListener("popstate", pop);
    window.addEventListener("hashchange", hash);
    window.addEventListener("scroll", observe, { passive: true });
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("keydown", interrupt);
    return () => {
      cancelFrame();
      document.removeEventListener("click", click, true);
      window.removeEventListener("popstate", pop);
      window.removeEventListener("hashchange", hash);
      window.removeEventListener("scroll", observe);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("keydown", interrupt);
      window.history.scrollRestoration = original;
    };
  }, []);
  return null;
}

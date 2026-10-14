"use client";
import { useEffect, type RefObject } from "react";
import { lockDocumentScroll } from "@/lib/scroll-lock";

export function useDialog(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const prior = document.activeElement as HTMLElement | null;
    const releaseScroll = lockDocumentScroll(document);
    // Make other branches inert, including when a media dialog is nested.
    const inertNodes: { element: HTMLElement; previous: boolean }[] = [];
    let branch: HTMLElement | null = ref.current;
    while (branch?.parentElement) {
      for (const sibling of Array.from(branch.parentElement.children)) {
        if (sibling instanceof HTMLElement && sibling !== branch && !["SCRIPT", "STYLE"].includes(sibling.tagName)) {
          inertNodes.push({ element: sibling, previous: sibling.inert }); sibling.inert = true;
        }
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }
    const focusable = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, video[controls], [tabindex="0"]') ?? []).filter(e => e.getClientRects().length > 0);
    const tick = requestAnimationFrame(() => (focusable()[0] || ref.current)?.focus({ preventScroll: true }));
    const keydown = (event: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if (dialogs[dialogs.length - 1] !== ref.current) return;
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key === "Tab") {
        const elements = focusable(); const first = elements[0], last = elements.at(-1);
        if (!first) { event.preventDefault(); ref.current?.focus({ preventScroll: true }); return; }
        if (event.shiftKey && (document.activeElement === first || !ref.current?.contains(document.activeElement))) { event.preventDefault(); last?.focus({ preventScroll: true }); }
        else if (!event.shiftKey && (document.activeElement === last || !ref.current?.contains(document.activeElement))) { event.preventDefault(); first.focus({ preventScroll: true }); }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => { cancelAnimationFrame(tick); document.removeEventListener("keydown", keydown); inertNodes.forEach(({ element, previous }) => { element.inert = previous; }); releaseScroll(); if (prior?.isConnected) prior.focus({ preventScroll: true }); };
  }, [open, ref, onClose]);
}

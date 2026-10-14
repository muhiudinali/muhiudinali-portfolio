export type ScrollPosition = { x: number; y: number };
export type ScrollPlan = { kind: "position"; position: ScrollPosition; focusMain: boolean } | { kind: "anchor"; id: string; focusMain: boolean };

// Keep each route/fragment's own position. A new link never inherits the previous
// page's bottom position, while Back/Forward restore the page being revisited.
export class NavigationScrollState {
  private current = "";
  private entry = "";
  private positions = new Map<string, ScrollPosition>();
  private routePositions = new Map<string, ScrollPosition>();
  private pending: { kind: "link" | "history"; destination: string } | null = null;

  observe(position: ScrollPosition) {
    if (this.current && !this.pending) {
      this.positions.set(this.entry, { ...position });
      this.routePositions.set(this.current, { ...position });
    }
  }

  begin(kind: "link" | "history", destination: string, position: ScrollPosition) {
    this.observe(position);
    this.pending = { kind, destination };
  }

  commit(destination: string, entry = destination): ScrollPlan | null {
    const intent = this.pending?.destination === destination ? this.pending.kind : null;
    if (destination === this.current && entry === this.entry && !intent) return null;
    this.current = destination;
    this.entry = entry;
    this.pending = null;
    const remembered = this.positions.get(entry) || this.routePositions.get(destination);
    if (intent === "history" && remembered) return { kind: "position", position: { ...remembered }, focusMain: false };
    const hashIndex = destination.indexOf("#");
    const fragment = hashIndex === -1 ? "" : destination.slice(hashIndex + 1);
    if (fragment) {
      let id = fragment;
      try { id = decodeURIComponent(fragment); } catch { /* An invalid fragment can still fall back to the page top. */ }
      return { kind: "anchor", id, focusMain: intent !== "history" };
    }
    return { kind: "position", position: { x: 0, y: 0 }, focusMain: intent !== "history" };
  }
}

export function navigationKey(url: URL) { return url.pathname + url.search + url.hash; }

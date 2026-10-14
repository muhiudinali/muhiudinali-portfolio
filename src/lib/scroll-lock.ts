type Lock = { depth: number; rootOverflow: string; bodyOverflow: string };
const locks = new WeakMap<Document, Lock>();

// The intro, navigation and media viewer share one lock. Closing a nested layer
// must not unlock a still-open layer or overwrite the page's original styles.
export function lockDocumentScroll(doc: Document): () => void {
  const state = locks.get(doc) || { depth: 0, rootOverflow: doc.documentElement.style.overflow, bodyOverflow: doc.body.style.overflow };
  locks.set(doc, state);
  state.depth++;
  doc.documentElement.style.overflow = "hidden";
  doc.body.style.overflow = "hidden";
  let released = false;
  return () => {
    if (released) return;
    released = true;
    state.depth--;
    if (state.depth === 0) {
      doc.documentElement.style.overflow = state.rootOverflow;
      doc.body.style.overflow = state.bodyOverflow;
      locks.delete(doc);
    }
  };
}

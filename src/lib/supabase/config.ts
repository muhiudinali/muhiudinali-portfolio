export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim();
  if (!url || !key || url.includes("your-project") || key.includes("replace_me")) return null;
  // Only public application keys belong in NEXT_PUBLIC variables.
  if (!key.startsWith("sb_publishable_")) {
    try {
      const encoded = key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      if (JSON.parse(atob(encoded)).role !== "anon") return null;
    } catch { return null; }
  }
  try { if (!["https:", "http:"].includes(new URL(url).protocol)) return null; } catch { return null; }
  return { url, key };
}

import type { Resource } from "./types";

export class ValidationError extends Error {}
export const resourceTables: Record<Resource, string> = {
  profile: "site_settings", services: "services", skills: "skills", experience: "experience", education: "education",
  socials: "social_links", projects: "projects", media: "project_media",
};
export function isResource(value: string): value is Resource { return Object.hasOwn(resourceTables, value); }
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
export function safeUrl(value: unknown, asset = false): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || value.length > 2048) throw new ValidationError("Use a valid URL (maximum 2048 characters).");
  const text = value.trim();
  if (asset && /^\/(?!\/)[a-z0-9/_\-.]+$/i.test(text)) return text;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error();
    return url.toString();
  } catch { throw new ValidationError("Use a full https:// URL."); }
}
export function phoneHref(value: string) { return `tel:${value.replace(/[^+0-9]/g, "")}`; }
export function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100).replace(/-$/g, ""); }

// Full-form validation: whitelist every column, reject extra role/id fields.
export function validateRecord(resource: Resource, input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new ValidationError("Invalid form data.");
  const raw = input as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const text = (key: string, max: number, required = true) => {
    if (typeof raw[key] !== "string") throw new ValidationError(`${key} must be text.`);
    const value = (raw[key] as string).trim();
    if ((required && !value) || value.length > max) throw new ValidationError(`${key} is required and must be at most ${max} characters.`);
    out[key] = value;
    return value;
  };
  const bool = (key: string) => {
    if (typeof raw[key] !== "boolean") throw new ValidationError(`${key} must be true or false.`);
    out[key] = raw[key];
  };
  const order = () => {
    if (!Number.isInteger(raw.sort_order) || (raw.sort_order as number) < 0 || (raw.sort_order as number) > 100000) throw new ValidationError("Order must be a non-negative whole number.");
    out.sort_order = raw.sort_order;
  };
  const url = (key: string, asset = false, required = false) => {
    const value = safeUrl(raw[key], asset);
    if (required && !value) throw new ValidationError(`${key} is required.`);
    out[key] = value;
  };
  switch (resource) {
    case "profile":
      text("name", 100); text("headline", 250); text("about", 10000);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text("email", 254))) throw new ValidationError("Enter a valid email address.");
      if (!/^\+?[0-9 ()-]{5,50}$/.test(text("phone", 50))) throw new ValidationError("Enter a valid phone number.");
      text("location", 150); url("portrait_url", true, true);
      break;
    case "services":
      text("title", 100); text("description", 2000);
      if (!["sparkles", "chart", "code"].includes(text("icon", 20))) throw new ValidationError("Select a skills icon.");
      if (!Array.isArray(raw.tags) || raw.tags.length > 20 || raw.tags.some(x => typeof x !== "string" || !x.trim() || x.length > 60)) throw new ValidationError("Use up to 20 skill tags, each at most 60 characters.");
      out.tags = raw.tags.map((x: string) => x.trim()); order(); bool("enabled");
      break;
    case "skills":
      text("label", 150);
      if (!["AI & Creative", "Performance Marketing", "Web & App"].includes(text("category", 100))) throw new ValidationError("Select a skill group.");
      order(); bool("enabled");
      break;
    case "experience":
      text("company", 150); text("role", 150); text("duration", 100); text("description", 5000); order(); bool("enabled");
      break;
    case "education":
      text("qualification", 200); text("status", 150); order(); bool("enabled");
      break;
    case "socials":
      text("label", 60); url("url", false, true); order(); bool("enabled");
      break;
    case "projects":
      text("title", 150);
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(text("slug", 100))) throw new ValidationError("Use a lowercase slug such as my-project-name.");
      if (!["AI & Creative", "Performance Marketing", "Web & App"].includes(text("category", 100))) throw new ValidationError("Select a project category.");
      if (raw.format === undefined) out.format = raw.category === "Web & App" ? "web-apps" : "image-ads";
      else if (!["image-ads", "video-ads", "web-apps", "branding"].includes(text("format", 30))) throw new ValidationError("Select a collection type.");
      if (raw.is_demo === undefined) out.is_demo = false; else bool("is_demo");
      text("summary", 500, false); text("description", 20000, false);
      url("cover_url", true); url("external_url"); url("repository_url"); bool("published"); bool("featured"); order();
      if (raw.published && !out.cover_url) throw new ValidationError("Add a cover image before publishing.");
      break;
    case "media":
      if (!isUuid(raw.project_id)) throw new ValidationError("Select a valid project.");
      out.project_id = raw.project_id;
      if (!["image", "video"].includes(text("kind", 20))) throw new ValidationError("Select image or video.");
      url("url", true, true); url("poster_url", true); text("alt", 300); text("caption", 2000, false); order();
      if (raw.kind === "video" && !out.poster_url) throw new ValidationError("Add a poster image for the video.");
      break;
  }
  const unknown = Object.keys(raw).filter(key => !Object.hasOwn(out, key));
  if (unknown.length) throw new ValidationError(`Unknown fields: ${unknown.join(", ")}`);
  return out;
}

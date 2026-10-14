import type { Resource } from "@/lib/types";
export type Field = { name: string; label: string; type?: "text" | "textarea" | "url" | "email" | "number" | "checkbox" | "select" | "tags"; required?: boolean; options?: string[]; optionLabels?: Record<string,string>; upload?: "image" | "media"; hint?: string; max?: number };
const order: Field = { name: "sort_order", label: "Display order", type: "number", hint: "Lower numbers appear first." };
const enabled: Field = { name: "enabled", label: "Visible on the portfolio", type: "checkbox" };
export const fieldSets: Record<Resource, Field[]> = {
  profile: [
    { name: "name", label: "Name", required: true, max: 100 },
    { name: "headline", label: "About headline", required: true, max: 250 },
    { name: "about", label: "About text", type: "textarea", required: true, max: 10000 },
    { name: "email", label: "Contact email", type: "email", required: true },
    { name: "phone", label: "Phone number", required: true, max: 50 },
    { name: "location", label: "Location", required: true, max: 150 },
    { name: "portrait_url", label: "Portrait image", upload: "image", required: true, hint: "Keep the approved transparent PNG, or upload a new background-removed portrait." },
  ],
  services: [
    { name: "title", label: "Role / skill area title", required: true, max: 100 },
    { name: "description", label: "Description", type: "textarea", required: true, max: 2000 },
    { name: "icon", label: "Icon", type: "select", options: ["sparkles", "chart", "code"] },
    { name: "tags", label: "Related service skills", type: "tags", hint: "Separate with commas; up to 20 tags. The complete portfolio skill list is edited in the Skills tab." }, order, enabled,
  ],
  skills: [
    { name: "label", label: "Skill name", required: true, max: 150 },
    { name: "category", label: "Skill group", type: "select", options: ["AI & Creative", "Performance Marketing", "Web & App"] }, order, enabled,
  ],
  experience: [
    { name: "company", label: "Company", required: true, max: 150 },
    { name: "role", label: "Role", required: true, max: 150 },
    { name: "duration", label: "Duration / dates", required: true, max: 100 },
    { name: "description", label: "Description", type: "textarea", required: true, max: 5000 }, order, enabled,
  ],
  education: [
    { name: "qualification", label: "Qualification", required: true, max: 200 },
    { name: "status", label: "Status / dates", required: true, max: 150 }, order, enabled,
  ],
  socials: [
    { name: "label", label: "Platform name", required: true, max: 60 },
    { name: "url", label: "Profile URL", type: "url", required: true, hint: "Full https:// link." }, order, enabled,
  ],
  projects: [
    { name: "title", label: "Project title", required: true, max: 150 },
    { name: "slug", label: "Page slug", required: true, max: 100, hint: "Example: ai-brand-campaign. Used in /projects/ai-brand-campaign." },
    { name: "category", label: "Category", type: "select", options: ["AI & Creative", "Performance Marketing", "Web & App"] },
    { name: "format", label: "Collection page", type: "select", options: ["image-ads", "video-ads", "web-apps", "branding"], optionLabels: { "image-ads": "Image Ads", "video-ads": "Video Ads", "web-apps": "Web & App", "branding": "Branding" }, hint: "Controls which separate collection page includes this project." },
    { name: "summary", label: "Short summary", type: "textarea", max: 500 },
    { name: "description", label: "Project details", type: "textarea", max: 20000, hint: "Plain text. Use a blank line to start a new paragraph." },
    { name: "cover_url", label: "Cover image", upload: "image", hint: "Required before publishing. Use a clear landscape image." },
    { name: "external_url", label: "Live project link (optional)", type: "url" },
    { name: "repository_url", label: "Source / GitHub link (optional)", type: "url" },
    order,
    { name: "featured", label: "Featured project", type: "checkbox" },
    { name: "published", label: "Publish on the portfolio", type: "checkbox", hint: "Leave unchecked to keep the project as a draft." },
    { name: "is_demo", label: "Sample project", type: "checkbox", hint: "Samples stay hidden from the public portfolio. Uncheck after replacing the sample with your own work." },
  ],
  media: [
    { name: "project_id", label: "Project", required: true },
    { name: "kind", label: "Media type", type: "select", options: ["image", "video"] },
    { name: "url", label: "Image / video file", upload: "media", required: true, hint: "Upload an image or MP4/WebM, or paste a direct HTTPS file URL. A YouTube page URL is not a video file." },
    { name: "poster_url", label: "Video poster image", upload: "image", hint: "Required for videos. This image appears before playback." },
    { name: "alt", label: "Accessible description", required: true, max: 300 },
    { name: "caption", label: "Caption", type: "textarea", max: 2000 }, order,
  ],
};
export const labels: Record<Resource, string> = { profile: "Profile & Contact", services: "Services & Roles", skills: "Skills", experience: "Experience", education: "Education", socials: "Social Links", projects: "Projects", media: "Project Media" };

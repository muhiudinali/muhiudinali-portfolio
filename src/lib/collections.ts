import type { Project, ProjectFormat, Service } from "./types";

export const collections: { format: ProjectFormat; label: string; title: string; description: string; artwork: string }[] = [
  { format: "image-ads", label: "Image Ads", title: "IMAGE / ADS", description: "Static creatives, visual concepts and social campaign compositions.", artwork: "/assets/photography/creative.png" },
  { format: "video-ads", label: "Video Ads", title: "VIDEO / ADS", description: "Motion creatives, short video sequences and visual storytelling.", artwork: "/assets/photography/branding.png" },
  { format: "web-apps", label: "Web & App", title: "WEB / APP", description: "Interfaces, websites, app experiences and development collections.", artwork: "/assets/photography/development.png" },
  { format: "branding", label: "Branding", title: "BRAND / DESIGN", description: "Visual identity, typography and brand design explorations.", artwork: "/assets/photography/branding.png" },
];
export function projectFormat(project: Pick<Project, "format" | "category" | "media">): ProjectFormat {
  if (collections.some(c => c.format === project.format)) return project.format;
  if (project.category === "Web & App") return "web-apps";
  return project.media?.length && project.media.every(m => m.kind === "video") ? "video-ads" : "image-ads";
}
export const collectionPath = (format: ProjectFormat) => `/projects/collections/${format}`;
const serviceSlugs: Record<string, string> = {
  "11111111-1111-4111-8111-111111111111": "ai-content-creation",
  "22222222-2222-4222-8222-222222222222": "performance-marketing",
  "33333333-3333-4333-8333-333333333333": "web-app-development",
};
export const serviceSlug = (service: Service) => serviceSlugs[service.id] || service.id;
export const servicePath = (service: Service) => `/services/${serviceSlug(service)}`;
export const serviceArt = (service: Service) => `/assets/photography/${service.icon === "chart" ? "marketing" : service.icon === "code" ? "development" : "creative"}.png`;

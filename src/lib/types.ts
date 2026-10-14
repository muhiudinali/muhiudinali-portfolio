export type ProjectFormat = "image-ads" | "video-ads" | "web-apps" | "branding";
export type Category = "AI & Creative" | "Performance Marketing" | "Web & App";
export interface Profile {
  id: number; name: string; headline: string; about: string; email: string;
  phone: string; location: string; portrait_url: string; updated_at?: string;
}
export interface Service {
  id: string; title: string; description: string; icon: "sparkles" | "chart" | "code";
  tags: string[]; sort_order: number; enabled: boolean;
}
export interface Skill {
  id: string; label: string; category: Category; sort_order: number; enabled: boolean;
  updated_at?: string;
}
export interface Experience {
  id: string; company: string; role: string; duration: string; description: string;
  sort_order: number; enabled: boolean;
}
export interface Education {
  id: string; qualification: string; status: string; sort_order: number; enabled: boolean;
}
export interface Social {
  id: string; label: string; url: string; sort_order: number; enabled: boolean;
}
export interface ProjectMedia {
  id: string; project_id: string; kind: "image" | "video"; url: string;
  poster_url: string | null; alt: string; caption: string; sort_order: number;
}
export interface Project {
  id: string; title: string; slug: string; category: Category; format: ProjectFormat; is_demo: boolean; summary: string;
  description: string; cover_url: string | null; external_url: string | null;
  repository_url: string | null; published: boolean; featured: boolean;
  sort_order: number; created_at?: string; updated_at?: string; media: ProjectMedia[];
}
export interface PortfolioData {
  profile: Profile; services: Service[]; skills: Skill[]; experience: Experience[];
  education: Education[]; socials: Social[]; projects: Project[];
}
export type Resource = "profile" | "services" | "skills" | "experience" | "education" | "socials" | "projects" | "media";
export type AdminSnapshot = PortfolioData & { media: ProjectMedia[] };

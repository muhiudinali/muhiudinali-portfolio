import type { Category, Project, ProjectFormat } from "./types";

type Spec = { title: string; slug: string; format: ProjectFormat; category: Category; cover: string; art: string[]; video?: boolean; summary: string };
const specs: Spec[] = [
  { title: "Studio / Image Ads", slug: "demo-image-ads", format: "image-ads", category: "AI & Creative", cover: "studio-ai", art: ["studio-ai","studio-frame","studio-brand","studio-ads","studio-story","studio-web"], summary: "A sample image-ad collection for exploring visual compositions and the expanding gallery." },
  { title: "Concept / Social Creatives", slug: "demo-social-creatives", format: "image-ads", category: "Performance Marketing", cover: "studio-ads", art: ["studio-ads","studio-ai","studio-story","studio-brand"], summary: "A sample collection showing how social creatives can be grouped inside a project." },
  { title: "Studio / Video Ads", slug: "demo-video-ads", format: "video-ads", category: "AI & Creative", cover: "studio-story", art: ["studio-ai","studio-ads","studio-story"], video: true, summary: "Three playable sample photo-motion clips, each with its own expanding poster and full video viewer." },
  { title: "Motion / Story Collection", slug: "demo-motion-story", format: "video-ads", category: "Performance Marketing", cover: "studio-frame", art: ["studio-story","studio-ai","studio-ads"], video: true, summary: "A sample video collection for reviewing poster selection, playback and return navigation." },
  { title: "Studio / Web & App", slug: "demo-web-app", format: "web-apps", category: "Web & App", cover: "demo-storefront", art: ["demo-storefront","demo-dashboard","studio-web","studio-frame"], summary: "Realistic device photographs showing the web and app project detail experience." },
  { title: "Studio / Brand Identity", slug: "demo-brand-identity", format: "branding", category: "AI & Creative", cover: "studio-brand", art: ["studio-brand","studio-frame","studio-ai","studio-story"], summary: "A sample identity collection with colour, typography and composition studies." },
];
const photos: Record<string, string> = {"studio-ai": "creative", "studio-ads": "marketing", "studio-web": "development", "studio-story": "branding", "studio-brand": "branding", "studio-frame": "creative", "demo-storefront": "development", "demo-dashboard": "marketing"};
const clip: Record<string, string> = { "studio-ai": "creative", "studio-ads": "strategy", "studio-story": "story" };
export const demoProjects: Project[] = specs.map((s, i) => {
  const id = `f1000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
  return {
    id, title: s.title, slug: s.slug, format: s.format, category: s.category, is_demo: true,
    summary: s.summary,
    description: "This is an editable sample project with generated realistic sample photography. It is not a client campaign or a claim about completed work.\n\nExplore the previews, open a full photograph or play a sample clip. The collection demonstrates how creative work and its supporting detail will appear in this portfolio.",
    cover_url: `/assets/photography/${photos[s.cover]}.png`, external_url: null, repository_url: null,
    published: true, featured: i === 0, sort_order: i,
    media: s.art.map((a, j) => ({
      id: `f2000000-0000-4000-8000-00000000${String(i + 1).padStart(2, "0")}${String(j + 1).padStart(2, "0")}`,
      project_id: id, kind: s.video ? "video" as const : "image" as const,
      url: s.video ? `/assets/demo/${clip[a]}.mp4` : `/assets/photography/${photos[a]}.png`,
      poster_url: s.video ? `/assets/photography/${photos[a]}.png` : null,
      alt: `Sample ${s.video ? "motion clip" : "photograph"} ${j + 1}: ${a.replaceAll("-", " ")}`,
      caption: `${s.video ? "Play sample clip" : "Generated sample photograph"} · ${j + 1}`, sort_order: j,
    })),
  };
});

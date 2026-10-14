import type { Category, Skill } from "./types";
// Skills transcribed from Muhiudin Ali's CV, grouped under his existing roles.
export const cvSkills = {
  creative: [
    "AI Content & Creative Ads", "AI-Powered Ads & Content Creation",
    "AI Image Ads", "AI Video Ads", "Logo Design & Brand Identity",
    "Graphic Design & Branding", "Adobe Photoshop", "Adobe Illustrator",
  ],
  marketing: [
    "Performance Marketing", "Social Media Management & Marketing", "SEO & Digital Marketing",
  ],
  development: [
    "Web & AI Website Development", "Frontend & Backend Development",
    "Next.js", "React", "UI/UX Design", "Figma Design",
  ],
};

// The twelve CV entries are individually editable, separate from role titles.
const entries: [string, Category][] = [
  ["AI Content & Creative Ads", "AI & Creative"],
  ["Social Media Management & Marketing", "Performance Marketing"],
  ["AI-Powered Ads & Content Creation", "AI & Creative"],
  ["Logo Design & Brand Identity", "AI & Creative"],
  ["SEO & Digital Marketing", "Performance Marketing"],
  ["Web & AI Website Development", "Web & App"],
  ["Frontend & Backend Development", "Web & App"],
  ["Next.js & React Development", "Web & App"],
  ["UI/UX Design", "Web & App"],
  ["Graphic Design & Branding", "AI & Creative"],
  ["Adobe Photoshop & Illustrator", "AI & Creative"],
  ["Figma Design", "Web & App"],
];
export const cvSkillRows: Skill[] = entries.map(([label, category], index) => ({
  id: `d1000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  label, category, sort_order: index, enabled: true,
}));

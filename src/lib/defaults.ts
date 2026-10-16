import type { PortfolioData } from "./types";
import { demoProjects } from "./demo-projects";
import { cvSkills, cvSkillRows } from "./cv-skills";

export const defaults: PortfolioData = {
  profile: {
    id: 1, name: "Muhiudin Ali", headline: "Co-Founder of Developers Tech · Ideas into content. Clicks into growth. Code into experiences.",
    about: "I am the Co-Founder & Performance Marketer at Developers Tech, bringing AI content, performance marketing and full-stack development together to build digital products that scale. From creative ad campaigns and AI + UGC video production to high-converting eCommerce stores and web applications, I connect the idea, the audience and the execution.",
    email: "muhiudinali215@gmail.com", phone: "+92301-4772404", location: "Faisalabad, Pakistan",
    portrait_url: "/assets/portrait.png",
  },
  services: [
    { id: "11111111-1111-4111-8111-111111111111", title: "AI Content Creator", description: "AI image and video creatives, visual storytelling, brand identity and content made for digital platforms.", icon: "sparkles", tags: cvSkills.creative, sort_order: 0, enabled: true },
    { id: "22222222-2222-4222-8222-222222222222", title: "Performance Marketer", description: "Campaign strategy, ad creatives, audience targeting, SEO and social media marketing with performance in focus.", icon: "chart", tags: cvSkills.marketing, sort_order: 1, enabled: true },
    { id: "33333333-3333-4333-8333-333333333333", title: "Web & App Developer", description: "Responsive interfaces and useful digital products, from design in Figma to development with React and Next.js.", icon: "code", tags: cvSkills.development, sort_order: 2, enabled: true },
  ],
  skills: cvSkillRows,
  experience: [
    { id: "33333333-0000-4333-8333-111111111111", company: "Developers Tech", role: "Co-Founder & Performance Marketer", duration: "2024 — Present", description: "Co-founded the software house and digital marketing agency in Faisalabad. Leading full-funnel performance marketing, Meta, Google & TikTok ad campaigns, creative strategy with AI + UGC video content, Shopify eCommerce growth, and scaling clients worldwide.", sort_order: 0, enabled: true },
    { id: "44444444-4444-4444-8444-444444444444", company: "Vexuls Software House", role: "Frontend Developer", duration: "1 year 2 months", description: "Worked on international client projects, frontend and backend features, Next.js websites and AI-enabled web experiences.", sort_order: 1, enabled: true },
    { id: "55555555-5555-4555-8555-555555555555", company: "Websoftice Agency", role: "AI Ads Creative & Ads Runner", duration: "6 months", description: "Created AI image and video ad creatives and worked on performance marketing campaigns.", sort_order: 2, enabled: true },
  ],
  education: [
    { id: "66666666-6666-4666-8666-666666666666", qualification: "BS Computer Science", status: "Currently studying", sort_order: 0, enabled: true },
    { id: "77777777-7777-4777-8777-777777777777", qualification: "Intermediate · FA / IT", status: "Completed", sort_order: 1, enabled: true },
    { id: "88888888-8888-4888-8888-888888888888", qualification: "Matric · Biology", status: "Completed", sort_order: 2, enabled: true },
  ],
  socials: [
    { id: "99999999-9999-4999-8999-999999999991", label: "LinkedIn", url: "https://www.linkedin.com/in/muhiudin-ali-374b9b438", sort_order: 0, enabled: true },
    { id: "99999999-9999-4999-8999-999999999992", label: "Instagram", url: "https://www.instagram.com/techwithali_official/?hl=en", sort_order: 1, enabled: true },
    { id: "99999999-9999-4999-8999-999999999993", label: "TikTok", url: "https://www.tiktok.com/@muhiudin.ali215", sort_order: 2, enabled: true },
    { id: "99999999-9999-4999-8999-999999999994", label: "X", url: "https://x.com/MuhiudinAli", sort_order: 3, enabled: true },
    { id: "99999999-9999-4999-8999-999999999995", label: "GitHub", url: "https://github.com/muhiudinali", sort_order: 4, enabled: true },
  ],
  projects: demoProjects,
};

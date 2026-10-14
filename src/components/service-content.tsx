import Link from "@/components/page-link";
import { ArrowUpRight } from "lucide-react";
import type { Category, PortfolioData, Service, Skill } from "@/lib/types";
import { serviceArt, servicePath } from "@/lib/collections";
import { ScrollLayer, ScrollScene } from "./scroll-scene";

export function ServiceList({ data }: { data: PortfolioData }) {
  return <ScrollScene className="service-list section-pad"><div className="section-kicker"><span>SERVICES / THE DISCIPLINES</span><span>EXPLORE THE DETAILS</span></div>{data.services.map((s, i) => <div className="service-row" key={s.id}><ScrollLayer className="service-row-art" distance={-65}><img src={serviceArt(s)} alt="" loading="lazy" /></ScrollLayer><ScrollLayer className="service-row-copy" distance={150} tilt={3} dim><span className="eyebrow">0{i + 1}</span><h2 className="display">{s.title.toUpperCase()}</h2><p>{s.description}</p><div className="service-tags">{s.tags.map(t => <span key={t}>{t}</span>)}</div><Link className="text-link" href={servicePath(s)}>Explore this service<ArrowUpRight size={20} /></Link></ScrollLayer></div>)}</ScrollScene>;
}
export function SkillInventory({ skills, services }: { skills: Skill[]; services: Service[] }) {
  const groups: [Category, Service["icon"]][] = [["AI & Creative", "sparkles"], ["Performance Marketing", "chart"], ["Web & App", "code"]];
  return <ScrollScene className="skill-inventory section-pad"><div className="section-kicker"><span>MY COMPLETE SKILL SET</span><span>CREATIVE THINKING / PRACTICAL EXECUTION</span></div><ScrollLayer distance={170} tilt={4} dim><h2 className="editorial">THE SKILLS.<br /><span>THE EXECUTION.</span></h2></ScrollLayer><div className="skill-groups">{groups.map(([category, icon]) => <div key={category}><h3>{services.find(service => service.icon === icon)?.title || category}</h3><ul>{skills.filter(s => s.enabled && s.category === category).map(skill => <li key={skill.id}>{skill.label}</li>)}</ul></div>)}</div></ScrollScene>;
}
export function ServiceDetail({ service }: { service: Service }) {
  const steps = service.icon === "code" ? ["Understand the experience", "Design the interface", "Build and refine"] : service.icon === "chart" ? ["Understand the audience", "Plan the creative direction", "Launch, review and refine"] : ["Develop the idea", "Create the visuals", "Refine the final collection"];
  return <ScrollScene className="service-detail section-pad"><div className="service-detail-grid"><ScrollLayer className="service-detail-art" distance={-80}><img src={serviceArt(service)} alt="" /><span className="service-art-label">CREATIVE / DIGITAL / EXECUTION</span></ScrollLayer><ScrollLayer className="service-detail-copy" distance={120} tilt={3}><p className="eyebrow">THE SERVICE</p><h2 className="display">{service.title.toUpperCase()}</h2><p>{service.description}</p><div className="service-tags">{service.tags.map(t => <span key={t}>{t}</span>)}</div><Link className="button blue" href="/contact">Discuss your project<ArrowUpRight size={18} /></Link></ScrollLayer></div><div className="service-process">{steps.map((s, i) => <div key={s}><span className="eyebrow">0{i + 1}</span><h3>{s}</h3></div>)}</div></ScrollScene>;
}

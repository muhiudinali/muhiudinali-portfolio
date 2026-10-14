import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { defaults } from "./defaults";
import { supabaseConfig } from "./supabase/config";
import { publicProjects, portfolioProjects } from "./public-projects";
import type { PortfolioData, Project, ProjectMedia, Profile, Service, Skill, Social, Education, Experience } from "./types";

// Public reads always use a fresh anonymous client, never an admin cookie.
export const getPortfolio = cache(async (): Promise<PortfolioData> => {
  const config = supabaseConfig();
  const showSamples = process.env.PORTFOLIO_SHOW_SAMPLES?.trim().toLowerCase() !== "false";
  if (!config) return { ...defaults, projects: portfolioProjects([], defaults.projects, showSamples) };
  const db = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: init?.signal ?? AbortSignal.timeout(10000) }) },
  });
  const [profile, services, skills, experience, education, socials, projects, media] = await Promise.all([
    db.from("site_settings").select("*").eq("id", 1).maybeSingle<Profile>(),
    db.from("services").select("*").eq("enabled", true).order("sort_order").returns<Service[]>(),
    db.from("skills").select("*").eq("enabled", true).order("sort_order").returns<Skill[]>(),
    db.from("experience").select("*").eq("enabled", true).order("sort_order").returns<Experience[]>(),
    db.from("education").select("*").eq("enabled", true).order("sort_order").returns<Education[]>(),
    db.from("social_links").select("*").eq("enabled", true).order("sort_order").returns<Social[]>(),
    db.from("projects").select("*").eq("published", true).eq("is_demo", false).order("featured", { ascending: false }).order("sort_order").order("created_at", { ascending: false }).returns<Project[]>(),
    db.from("project_media").select("*").order("sort_order").returns<ProjectMedia[]>(),
  ]);
  const errors = [profile, services, skills, experience, education, socials, projects, media].filter(x => x.error);
  if (errors.length) console.error("Portfolio database read failed. Check SQL setup and RLS.", errors.map(x => x.error?.code));
  return {
    profile: profile.data ?? defaults.profile,
    services: services.error ? defaults.services : services.data ?? [],
    skills: skills.error ? defaults.skills : skills.data ?? [],
    experience: experience.error ? defaults.experience : experience.data ?? [],
    education: education.error ? defaults.education : education.data ?? [],
    socials: socials.error ? defaults.socials : socials.data ?? [],
    projects: portfolioProjects(publicProjects(projects.data ?? []).map(project => ({ ...project, media: (media.data ?? []).filter(m => m.project_id === project.id) })), defaults.projects, showSamples),
  };
});

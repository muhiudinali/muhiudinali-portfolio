import type { Profile, Social } from "./types";
import { phoneHref } from "./validation";

export interface ContactPlatform { label: string; logo: string; href: string; external: boolean }
const assets = "/assets/contact-logos/";

export function socialLogo(social: Social): string | null {
  let hostname: string;
  try { hostname = new URL(social.url).hostname.toLowerCase().replace(/^(www|m)\./, ""); }
  catch { return null; }
  const brands: Record<string, string> = {
    "linkedin.com": "linkedin", "instagram.com": "instagram", "tiktok.com": "tiktok",
    "x.com": "x", "twitter.com": "x", "github.com": "github",
  };
  return brands[hostname] ? `${assets}${brands[hostname]}.svg` : null;
}

export function contactPlatforms(profile: Profile, socials: Social[]): ContactPlatform[] {
  return [
    ...(profile.email ? [{ label: "Email", logo: `${assets}email.svg`, href: `mailto:${profile.email}`, external: false }] : []),
    ...(profile.phone ? [{ label: "Phone", logo: `${assets}phone.svg`, href: phoneHref(profile.phone), external: false }] : []),
    ...socials.filter(s => s.enabled).flatMap(s => {
      const logo = socialLogo(s);
      return logo ? [{ label: s.label, logo, href: s.url, external: true }] : [];
    }),
  ];
}

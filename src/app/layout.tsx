import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { NavigationScroll } from "@/components/navigation-scroll";
import { getPortfolio } from "@/lib/data";
import "./globals.css";
export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  return {
    title: { default: `${profile.name} · AI, Marketing & Development`, template: `%s · ${profile.name}` },
    description: `${profile.name} — ${profile.headline} ${profile.location}.`,
    icons: { icon: "/icon.svg" },
  };
}
export const viewport: Viewport = { themeColor: "#EDECE6" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" data-scroll-behavior="smooth"><body><Suspense fallback={null}><NavigationScroll /></Suspense><a href="#main" className="skip-link">Skip to content</a><noscript><style>{`.entry-loader{display:none!important}.scroll-layer,.skills-letter{opacity:1!important;transform:none!important}`}</style></noscript>{children}</body></html>; }

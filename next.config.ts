import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/assets/studio-ai.svg", destination: "/assets/photography/creative.png", permanent: true },
      { source: "/assets/studio-ads.svg", destination: "/assets/photography/marketing.png", permanent: true },
      { source: "/assets/studio-web.svg", destination: "/assets/photography/development.png", permanent: true },
      { source: "/assets/studio-story.svg", destination: "/assets/photography/branding.png", permanent: true },
      { source: "/assets/studio-brand.svg", destination: "/assets/photography/branding.png", permanent: true },
      { source: "/assets/studio-frame.svg", destination: "/assets/photography/creative.png", permanent: true },
      { source: "/assets/demo-storefront.svg", destination: "/assets/photography/development.png", permanent: true },
      { source: "/assets/demo-dashboard.svg", destination: "/assets/photography/marketing.png", permanent: true }
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      { source: "/api/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
};
export default nextConfig;

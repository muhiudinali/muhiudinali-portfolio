import type { Metadata } from "next";
export const metadata: Metadata = { title: "Portfolio Admin", robots: { index: false, follow: false, nocache: true } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <div className="admin-root">{children}</div>; }

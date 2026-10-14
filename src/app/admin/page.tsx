import { redirect } from "next/navigation";
import { adminSession } from "@/lib/auth";
import { Dashboard } from "@/components/admin/dashboard";
import { logoutAction } from "./actions";
import type { AdminSnapshot } from "@/lib/types";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await adminSession();
  if (session.status === "unauthenticated" || session.status === "unconfigured") redirect("/admin/login");
  if (session.status !== "authorized") return <main className="admin-access-message"><h1>Admin access required</h1><p>{session.status === "schema-error" ? "Run the two SQL setup files in order." : "Add this Auth user to the admin allowlist with 02-create-admin.sql."}</p><form action={logoutAction}><button className="button blue">Sign out</button></form></main>;
  const db = session.supabase;
  const results = await Promise.all([
    db.from("site_settings").select("*").eq("id", 1).single(),
    db.from("services").select("*").order("sort_order"),
    db.from("skills").select("*").order("sort_order"),
    db.from("experience").select("*").order("sort_order"),
    db.from("education").select("*").order("sort_order"),
    db.from("social_links").select("*").order("sort_order"),
    db.from("projects").select("*,format,is_demo").order("sort_order").order("created_at", { ascending: false }),
    db.from("project_media").select("*").order("sort_order"),
  ]);
  if (results.some(r => r.error)) return <main className="admin-access-message"><h1>Database setup needed</h1><p>For a new setup, run 01-schema-and-seed.sql. For an existing setup, run 03-upgrade-project-collections.sql and 06-cv-skills-editor.sql before using this edition.</p><form action={logoutAction}><button className="button blue">Sign out</button></form></main>;
  const [profile, services, skills, experience, education, socials, projects, media] = results.map(r => r.data);
  return <Dashboard email={session.user.email ?? "Admin"} initial={{ profile, services, skills, experience, education, socials, projects, media } as AdminSnapshot} />;
}

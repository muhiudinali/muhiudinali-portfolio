"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowUpRight, CheckCircle2, FileImage, FolderKanban, LayoutDashboard, Pencil, Plus, Trash2, X } from "lucide-react";
import type { AdminSnapshot, Resource } from "@/lib/types";
import { logoutAction } from "@/app/admin/actions";
import { RecordForm, type Row } from "./record-form";
import { labels } from "./fields";
import { collections, projectFormat } from "@/lib/collections";

const tabs: (Resource | "overview")[] = ["overview", "projects", "media", "profile", "skills", "services", "experience", "education", "socials"];
function rowTitle(row: Row) { return String(row.title || row.company || row.qualification || row.label || row.alt || "Untitled"); }

export function Dashboard({ initial, email }: { initial: AdminSnapshot; email: string }) {
  const [tab, setTab] = useState<Resource | "overview">("overview");
  const [editing, setEditing] = useState<{ resource: Resource; row: Row | null } | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const refresh = () => startTransition(() => { router.refresh(); });
  const rows = tab === "overview" || tab === "profile" ? [] : initial[tab] as unknown as Row[];
  const published = initial.projects.filter(p => p.published && !p.is_demo).length;
  const switchTab = (next: Resource | "overview") => { setTab(next); setEditing(null); setDeleting(null); setError(""); };
  async function remove() {
    if (!deleting || tab === "overview" || tab === "profile") return;
    setError("");
    try {
      const response = await fetch(`/api/admin/content/${tab}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleting.id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete.");
      setDeleting(null); refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete."); }
  }
  return <div className="admin-shell">
    <aside className="admin-sidebar"><Link href="/" className="brand">{initial.profile.name.toUpperCase()}<span>↗</span></Link><p className="eyebrow">PORTFOLIO STUDIO</p><nav aria-label="Admin navigation">{tabs.map(t => <button key={t} onClick={() => switchTab(t)} className={tab === t ? "active" : ""}>{t === "overview" ? <LayoutDashboard size={17} /> : t === "projects" ? <FolderKanban size={17} /> : t === "media" ? <FileImage size={17} /> : <span className="nav-dot" />}{t === "overview" ? "Overview" : labels[t]}</button>)}</nav><div className="admin-sidebar-bottom"><small>{email}</small><Link href="/admin/reset-password" className="admin-password-link">Change password</Link><form action={logoutAction}><button>Sign out ↗</button></form></div></aside>
    <main className="admin-main" id="main"><header className="admin-topbar"><span className="admin-status"><i />Admin workspace{pending && " · Refreshing…"}</span><Link href="/" target="_blank" className="text-link">View portfolio<ArrowUpRight size={16} /></Link></header>
      {tab === "overview" ? <><div className="admin-page-title"><p className="eyebrow">YOUR DIGITAL WORKSPACE</p><h1>Make it yours.</h1><p className="muted">Your content, projects and creative work—all in one place.</p></div><div className="admin-stats"><div><FolderKanban /><span>{initial.projects.length}</span><p>Total projects</p></div><div><CheckCircle2 /><span>{published}</span><p>Published</p></div><div><Pencil /><span>{initial.projects.length - published}</span><p>Drafts & samples</p></div><div><FileImage /><span>{initial.media.length}</span><p>Media items</p></div></div><div className="admin-collection-summary">{collections.map(c => <div key={c.format}><strong>{initial.projects.filter(p=>projectFormat(p)===c.format).length}</strong><span>{c.label}</span></div>)}</div><div className="admin-welcome"><h2>Bring your work into the spotlight.</h2><p>Samples stay hidden from the public portfolio. Add your own covers and media, choose the collection, clear Sample project and publish when ready.</p><button className="button blue" onClick={() => { switchTab("projects"); setEditing({ resource: "projects", row: null }); }}>Add your project<Plus size={18} /></button></div><div className="admin-quick-links"><button onClick={() => switchTab("profile")}><span>Profile & contact</span><small>Update your story, portrait and contact details.</small><ArrowUpRight /></button><button onClick={() => switchTab("skills")}><span>Skills</span><small>Edit, add, reorder or hide individual CV skills.</small><ArrowUpRight /></button><button onClick={() => switchTab("services")}><span>Services & roles</span><small>Edit your AI, marketing and development roles.</small><ArrowUpRight /></button></div><p className="admin-help">Upload only work intended for public sharing. Supabase Storage file URLs are public; unpublished project records stay hidden from visitors.</p></> : <>
        <div className="admin-page-title admin-title-row"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h1>{labels[tab]}</h1>{tab === "media" && <p className="muted">Save a project first, then add its images or videos here.</p>}</div>{tab !== "profile" && <button className="button blue" disabled={tab === "media" && !initial.projects.length} onClick={() => setEditing({ resource: tab, row: null })}><Plus size={17} />Add {tab === "media" ? "media" : "new"}</button>}</div>
        {tab === "profile" ? <div className="admin-editor"><RecordForm key={initial.profile.updated_at || "profile"} resource="profile" row={initial.profile as unknown as Row} projects={initial.projects} onSaved={refresh} /></div> : <>
          {editing ? <div className="admin-editor"><div className="editor-heading"><h2>{editing.row ? "Edit" : "Add"} {tab === "projects" ? "project" : tab === "media" ? "media" : "content"}</h2><button className="icon-button" aria-label="Close editor" onClick={() => setEditing(null)}><X /></button></div><RecordForm key={String(editing.row?.id || "new") + tab} resource={tab} row={editing.row} projects={initial.projects} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} /></div> : <div className="admin-record-list">{rows.length ? rows.map(row => <article className="admin-record" key={String(row.id)}>{(row.cover_url || row.poster_url || (row.kind === "image" && row.url)) ? <img src={String(row.cover_url || row.poster_url || row.url)} alt="" /> : <span className="record-placeholder"><FileImage size={22} /></span>}<div className="record-copy"><h2>{rowTitle(row)}</h2><p>{tab === "projects" ? `${row.category} · ${String(row.format || "image-ads").replaceAll("-", " ")} · /projects/${row.slug}` : tab === "media" ? initial.projects.find(p => p.id === row.project_id)?.title || "Project media" : String(row.category || row.role || row.status || row.url || row.description || "").slice(0, 130)}</p><small>Order: {String(row.sort_order ?? 0)}{row.is_demo ? <span className="demo-inline">SAMPLE PROJECT</span> : null}</small></div>{tab === "projects" && <span className={`status-pill ${row.published && !row.is_demo ? "published" : ""}`}>{row.is_demo ? "Sample · Hidden" : row.published ? "Published" : "Draft"}{row.featured ? " · Featured" : ""}</span>}{Object.hasOwn(row, "enabled") && <span className="status-pill">{row.enabled ? "Visible" : "Hidden"}</span>}<div className="record-actions"><button className="icon-button" aria-label={`Edit ${rowTitle(row)}`} onClick={() => setEditing({ resource: tab, row })}><Pencil size={18} /></button><button className="icon-button danger" aria-label={`Delete ${rowTitle(row)}`} onClick={() => { setDeleting(row); setError(""); }}><Trash2 size={18} /></button></div></article>) : <div className="admin-empty"><FolderKanban size={38} /><h2>Ready for your {tab === "media" ? "first media item" : "first entry"}.</h2><p>Use the add button above to get started.</p></div>}</div>}
        </>}
      </>}
      {deleting && <div className="delete-confirm"><h2>Delete “{rowTitle(deleting)}”?</h2><p>{tab === "projects" ? "The project and its gallery records will be removed. Uploaded files remain in Storage for manual cleanup." : "This entry will be removed from your portfolio. Uploaded files remain in Storage."}</p>{error && <p className="form-error" role="alert">{error}</p>}<div><button className="small-button danger" onClick={remove}>Delete entry</button><button className="small-button" onClick={() => setDeleting(null)}>Keep it</button></div></div>}
    </main>
  </div>;
}

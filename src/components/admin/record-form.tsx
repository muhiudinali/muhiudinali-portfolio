"use client";
import { useRef, useState, type FormEvent } from "react";
import { Check, Upload, X } from "lucide-react";
import { browserClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/validation";
import type { Project, Resource } from "@/lib/types";
import { fieldSets, type Field } from "./fields";

export type Row = Record<string, unknown>;
const fileTypes: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "video/webm": "webm" };

function UploadField({ field, onUpload, folder }: { field: Field; onUpload: (url: string, kind: string) => void; folder: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function upload(file: File | undefined) {
    if (!file) return;
    setMessage("");
    if (!fileTypes[file.type] || (field.upload === "image" && !file.type.startsWith("image/"))) { setMessage("Use JPEG, PNG, WebP, GIF or a supported MP4/WebM video."); return; }
    if (file.size > 50 * 1024 * 1024) { setMessage("Maximum upload size is 50 MB. For larger videos, paste a hosted direct video URL."); return; }
    setBusy(true);
    try {
      const db = browserClient();
      const path = `${folder}/${crypto.randomUUID()}.${fileTypes[file.type]}`;
      const { error } = await db.storage.from("portfolio-media").upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
      if (error) throw error;
      onUpload(db.storage.from("portfolio-media").getPublicUrl(path).data.publicUrl, file.type.startsWith("video/") ? "video" : "image");
      setMessage("Uploaded. Save the form to attach it.");
    } catch { setMessage("Upload failed. Check your login, SQL storage policies and bucket limits."); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  }
  return <div className="upload-field"><input ref={input} type="file" accept={field.upload === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"} hidden onChange={e => upload(e.target.files?.[0])} /><button type="button" className="small-button" disabled={busy} onClick={() => input.current?.click()}><Upload size={15} />{busy ? "Uploading…" : "Upload file"}</button>{message && <small role="status">{message}</small>}</div>;
}

export function RecordForm({ resource, row, projects, onSaved, onCancel }: { resource: Resource; row: Row | null; projects: Project[]; onSaved: () => void; onCancel?: () => void }) {
  const fields = fieldSets[resource];
  const [values, setValues] = useState<Row>(() => Object.fromEntries(fields.map(f => [f.name, f.type === "tags" ? (Array.isArray(row?.[f.name]) ? (row![f.name] as string[]).join(", ") : "") : row?.[f.name] ?? (f.type === "checkbox" ? f.name === "enabled" : f.type === "number" ? 0 : f.options?.[0] || (f.name === "project_id" ? projects[0]?.id || "" : ""))])));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const set = (key: string, value: unknown) => { setSuccess(false); setValues(v => ({ ...v, [key]: value })); };
  async function save(event: FormEvent) {
    event.preventDefault(); setPending(true); setError(""); setSuccess(false);
    const payload = Object.fromEntries(fields.map(f => [f.name, f.type === "number" ? Number(values[f.name]) : f.type === "tags" ? String(values[f.name]).split(",").map(s => s.trim()).filter(Boolean) : values[f.name]]));
    try {
      const response = await fetch(`/api/admin/content/${resource}`, { method: row?.id || resource === "profile" ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: row?.id, data: payload }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save.");
      setSuccess(true); onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save."); }
    finally { setPending(false); }
  }
  return <form className="record-form" onSubmit={save}><fieldset disabled={pending}>
    {fields.map(field => <div className={`admin-field ${field.type === "checkbox" ? "checkbox-field" : ""}`} key={field.name}>
      {field.type === "checkbox" ? <label><input type="checkbox" checked={!!values[field.name]} onChange={e => set(field.name, e.target.checked)} />{field.label}</label> : <><label htmlFor={`field-${field.name}`}>{field.label}{field.required ? " *" : ""}</label>
        {field.type === "textarea" ? <textarea id={`field-${field.name}`} value={String(values[field.name] ?? "")} rows={field.name === "description" ? 7 : 4} maxLength={field.max} required={field.required} onChange={e => set(field.name, e.target.value)} /> : field.type === "select" || field.name === "project_id" ? <select id={`field-${field.name}`} value={String(values[field.name] ?? "")} required={field.required} onChange={e => set(field.name, e.target.value)}>{field.name === "project_id" ? <><option value="">Choose a project</option>{projects.map(p => <option value={p.id} key={p.id}>{p.title}</option>)}</> : field.options?.map(o => <option key={o} value={o}>{field.optionLabels?.[o] || o}</option>)}</select> : <input id={`field-${field.name}`} type={field.type === "tags" ? "text" : field.type || "text"} value={String(values[field.name] ?? "")} required={field.required} maxLength={field.max} min={field.type === "number" ? 0 : undefined} step={field.type === "number" ? 1 : undefined} onChange={e => {
          const value = e.target.value;
          setValues(v => ({ ...v, [field.name]: value, ...(resource === "projects" && field.name === "title" && (!v.slug || v.slug === slugify(String(v.title))) ? { slug: slugify(value) } : {}) }));
          setSuccess(false);
        }} />}</>}
      {field.hint && <small>{field.hint}</small>}
      {field.upload && <UploadField field={field} folder={resource === "media" ? `projects/${values.project_id || "unattached"}` : resource} onUpload={(url, kind) => { set(field.name, url); if (resource === "media" && field.name === "url") set("kind", kind); }} />}
      {field.upload === "image" && Boolean(values[field.name]) && <img className="admin-image-preview" src={String(values[field.name])} alt={`${field.label} preview`} />}
    </div>)}
    {error && <p className="form-error" role="alert">{error}</p>}{success && <p className="form-success" role="status"><Check size={16} />Saved.</p>}
    <div className="form-actions"><button className="button blue" disabled={pending}>{pending ? "Saving…" : "Save changes"}<Check size={17} /></button>{onCancel && <button type="button" className="button outline" onClick={onCancel}><X size={17} />Cancel</button>}</div>
  </fieldset></form>;
}

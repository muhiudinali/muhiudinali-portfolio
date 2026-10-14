"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import Link from "next/link";

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return <form action={action} className="admin-login-form">
    <span className="admin-lock"><LockKeyhole size={22} /></span>
    <p className="eyebrow">PRIVATE WORKSPACE</p>
    <h1>Welcome back.</h1>
    <p className="muted">Edit your profile, individual skills, services, projects, media and contact links.</p>
    {!configured && <div className="notice">Connect Supabase to enable this private editor. Add the project URL and publishable/anon key in Vercel, run 01 and 02 for a new setup, or 06 for the Skills upgrade, then redeploy. SETUP.md in the source folder has the complete steps.</div>}
    <label>Email<input name="email" type="email" autoComplete="username" required defaultValue="muhiudinali215@gmail.com" /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
    {state.error && <p role="alert" className="form-error">{state.error}</p>}
    <button className="button blue" disabled={pending || !configured}>{pending ? "Signing in…" : "Sign in"}<ArrowUpRight size={18} /></button>
    <Link href="/admin/forgot-password" className="text-link">Forgot your password?</Link>
  </form>;
}

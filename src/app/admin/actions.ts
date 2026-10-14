"use server";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";

export async function loginAction(_state: { error: string }, form: FormData) {
  if (!supabaseConfig()) return { error: "Supabase environment variables are missing. Follow SETUP.md and redeploy." };
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  if (!email || !password || email.length > 254 || password.length > 1000) return { error: "Enter your admin email and password." };
  const db = await serverClient();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { error: "Could not sign in. Check your email/password and try again." };
  const check = await db.rpc("is_portfolio_admin");
  if (check.error || check.data !== true) {
    await db.auth.signOut();
    return { error: check.error ? "Run 01-schema-and-seed.sql and 02-create-admin.sql first." : "This account has no admin access. Add it with 02-create-admin.sql." };
  }
  redirect("/admin");
}
export async function logoutAction() {
  if (supabaseConfig()) { const db = await serverClient(); await db.auth.signOut(); }
  redirect("/admin/login");
}

export async function requestResetAction(_state: { error: string; message: string }, form: FormData) {
  if (!supabaseConfig()) return { error: "Supabase is not configured.", message: "" };
  const email = String(form.get("email") || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { error: "Enter a valid email address.", message: "" };
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!site) return { error: "Set NEXT_PUBLIC_SITE_URL in Vercel and configure Supabase Auth URLs first.", message: "" };
  const db = await serverClient();
  const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: `${site}/auth/callback` });
  if (error) return { error: "Could not send the recovery email. Check Supabase email settings or try again later.", message: "" };
  return { error: "", message: "If this account exists, a recovery link will arrive by email. Open it to choose a new password." };
}

export async function updatePasswordAction(_state: { error: string }, form: FormData) {
  const password = String(form.get("password") || "");
  const confirmation = String(form.get("confirmation") || "");
  if (password.length < 12 || password.length > 128) return { error: "Use a password with 12–128 characters." };
  if (password !== confirmation) return { error: "The two passwords do not match." };
  const { adminSession } = await import("@/lib/auth");
  const session = await adminSession();
  if (session.status !== "authorized") return { error: "An authorized admin session is required. Request a new recovery link." };
  const { error } = await session.supabase.auth.updateUser({ password });
  if (error) return { error: "Could not update the password. Check the password requirements in your Supabase project." };
  await session.supabase.auth.signOut();
  redirect("/admin/login?notice=password-updated");
}

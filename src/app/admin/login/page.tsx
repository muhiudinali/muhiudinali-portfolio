import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
export const dynamic = "force-dynamic";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const session = await adminSession();
  if (session.status === "authorized") redirect("/admin");
  const { notice } = await searchParams;
  return <main id="main" className="admin-login"><Link href="/" className="brand">MUHIUDIN ALI<span>↗</span></Link>{notice === "password-updated" && <p className="form-success" role="status">Password updated. Sign in with your new password.</p>}{notice === "recovery-expired" && <p className="form-error" role="alert">This recovery link is invalid or expired. Request a new one.</p>}<LoginForm configured={session.status !== "unconfigured"} /></main>;
}

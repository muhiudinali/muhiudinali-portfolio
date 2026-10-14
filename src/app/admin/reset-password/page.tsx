import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSession } from "@/lib/auth";
import { ResetPasswordForm } from "@/components/admin/password-forms";
export const dynamic = "force-dynamic";
export default async function ResetPasswordPage() {
  const session = await adminSession();
  if (session.status !== "authorized") redirect("/admin/login?notice=recovery-expired");
  return <main id="main" className="admin-login"><Link className="brand" href="/">MUHIUDIN ALI<span>↗</span></Link><ResetPasswordForm /></main>;
}

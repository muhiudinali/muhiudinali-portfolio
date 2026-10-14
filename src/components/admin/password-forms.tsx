"use client";
import { useActionState } from "react";
import Link from "next/link";
import { requestResetAction, updatePasswordAction } from "@/app/admin/actions";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestResetAction, { error: "", message: "" });
  return <form className="admin-login-form" action={action}><p className="eyebrow">ACCOUNT RECOVERY</p><h1>Reset your password.</h1><p className="muted">We’ll send a recovery link to your email.</p><label>Email<input name="email" type="email" required autoComplete="email" /></label>{state.error && <p role="alert" className="form-error">{state.error}</p>}{state.message && <p role="status" className="form-success">{state.message}</p>}<button className="button blue" disabled={pending}>{pending ? "Sending…" : "Send recovery link ↗"}</button><Link className="text-link" href="/admin/login">Back to sign in</Link></form>;
}
export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, { error: "" });
  return <form className="admin-login-form" action={action}><p className="eyebrow">ACCOUNT SECURITY</p><h1>Choose a new password.</h1><label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label><label>Confirm password<input name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label><small>Use at least 12 characters.</small>{state.error && <p role="alert" className="form-error">{state.error}</p>}<button className="button blue" disabled={pending}>{pending ? "Updating…" : "Update password ↗"}</button><Link className="text-link" href="/admin">Back to admin</Link></form>;
}

import { NextResponse, type NextRequest } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (supabaseConfig()) {
    const db = await serverClient();
    const tokenHash = params.get("token_hash"), code = params.get("code");
    const result = tokenHash && params.get("type") === "recovery"
      ? await db.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" })
      : code ? await db.auth.exchangeCodeForSession(code) : null;
    if (result && !result.error) {
      const response = NextResponse.redirect(new URL("/admin/reset-password", request.url));
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }
  const response = NextResponse.redirect(new URL("/admin/login?notice=recovery-expired", request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

import "server-only";
import { serverClient } from "./supabase/server";
import { supabaseConfig } from "./supabase/config";

export async function adminSession() {
  if (!supabaseConfig()) return { status: "unconfigured" as const };
  const supabase = await serverClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { status: "unauthenticated" as const };
  const check = await supabase.rpc("is_portfolio_admin");
  if (check.error) return { status: "schema-error" as const };
  if (check.data !== true) return { status: "forbidden" as const };
  return { status: "authorized" as const, supabase, user };
}

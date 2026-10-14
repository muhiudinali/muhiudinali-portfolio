import { NextResponse, type NextRequest } from "next/server";
import { adminSession } from "@/lib/auth";
import { isResource, isUuid, resourceTables, validateRecord, ValidationError } from "@/lib/validation";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ resource: string }> };
const error = (message: string, status: number) => NextResponse.json({ error: message }, { status });

async function handle(request: NextRequest, context: Context, method: "POST" | "PATCH" | "DELETE") {
  const { resource } = await context.params;
  if (!isResource(resource)) return error("Unknown content type.", 404);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return error("Request origin rejected.", 403);
  const session = await adminSession();
  if (session.status !== "authorized") return error("Admin login required.", session.status === "unauthenticated" ? 401 : 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return error("Send JSON data.", 415);
  if (Number(request.headers.get("content-length") || 0) > 100000) return error("Request too large.", 413);
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new ValidationError("Invalid request.");
    if (resource === "profile" && method !== "PATCH") throw new ValidationError("The profile can only be edited.");
    const id = resource === "profile" ? 1 : body.id;
    if (method !== "POST" && resource !== "profile" && !isUuid(id)) throw new ValidationError("Invalid record ID.");
    const table = resourceTables[resource];
    const query = session.supabase.from(table);
    const result = method === "DELETE"
      ? await query.delete().eq("id", id).select("id").maybeSingle()
      : method === "POST"
        ? await query.insert(validateRecord(resource, body.data)).select("*").single()
        : await query.update(validateRecord(resource, body.data)).eq("id", id).select("*").maybeSingle();
    if (result.error) {
      if (result.error.code === "23505") return error("That project slug is already in use.", 409);
      if (result.error.code === "23503") return error("The selected project no longer exists. Reload the admin panel.", 400);
      console.error("Admin content operation failed:", result.error.code);
      return error("Could not save. Check your SQL setup, permissions and required fields.", 400);
    }
    if (!result.data) return error("Record not found.", 404);
    return NextResponse.json({ data: result.data });
  } catch (cause) {
    if (cause instanceof ValidationError) return error(cause.message, 400);
    if (cause instanceof SyntaxError) return error("Invalid JSON.", 400);
    console.error("Admin operation failed.");
    return error("Something went wrong. Please try again.", 500);
  }
}
export const POST = (request: NextRequest, context: Context) => handle(request, context, "POST");
export const PATCH = (request: NextRequest, context: Context) => handle(request, context, "PATCH");
export const DELETE = (request: NextRequest, context: Context) => handle(request, context, "DELETE");

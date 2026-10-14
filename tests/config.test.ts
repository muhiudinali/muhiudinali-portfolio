import { test } from "node:test";
import assert from "node:assert/strict";
import { supabaseConfig } from "../src/lib/supabase/config.ts";

const names = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
function withEnv(values: Record<string, string>, run: () => void) {
  const old = Object.fromEntries(names.map(name => [name, process.env[name]]));
  names.forEach(name => { delete process.env[name]; }); Object.assign(process.env, values);
  try { run(); } finally { names.forEach(name => { if (old[name] === undefined) delete process.env[name]; else process.env[name] = old[name]; }); }
}
const jwt = (role: string) => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.test-only`;
test("missing or example credentials do not enable the admin client", () => {
  withEnv({}, () => assert.equal(supabaseConfig(), null));
  withEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://your-project.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_replace_me" }, () => assert.equal(supabaseConfig(), null));
});
test("secret and service-role credentials are rejected by the config", () => {
  for (const key of ["sb_secret_example", jwt("service_role"), "neon-connection-string"])
    withEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key }, () => assert.equal(supabaseConfig(), null));
});
test("publishable key and legacy anon-key configuration are accepted", () => {
  withEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test" }, () => assert.ok(supabaseConfig()));
  withEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: jwt("anon") }, () => assert.ok(supabaseConfig()));
});

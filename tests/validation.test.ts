import { test } from "node:test";
import assert from "node:assert/strict";
import { validateRecord, safeUrl, slugify, phoneHref, isResource } from "../src/lib/validation.ts";

const draft = { title: "My real project", slug: "my-real-project", category: "Web & App", summary: "", description: "", cover_url: "", external_url: "", repository_url: "", published: false, featured: false, sort_order: 0 };
test("reject script/data/protocol-relative URLs and embedded credentials", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,hello", "//evil.test/image.png", "http://example.com", "https://user:pass@example.com"])
    assert.throws(() => safeUrl(url));
  assert.throws(() => safeUrl("//example.com/image.png", true));
  assert.equal(safeUrl("/assets/portrait.png", true), "/assets/portrait.png");
  assert.equal(safeUrl("https://example.com/work"), "https://example.com/work");
});
test("reject write payloads that attempt to set an ID or an admin role", () => {
  assert.throws(() => validateRecord("projects", { ...draft, id: "mine" }), /Unknown fields/);
  assert.throws(() => validateRecord("projects", { ...draft, role: "admin" }), /Unknown fields/);
  assert.equal(isResource("admin_users"), false);
  assert.equal(isResource("__proto__"), false);
});
test("publishing needs a cover and videos need a poster", () => {
  assert.equal(validateRecord("projects", draft).cover_url, null);
  assert.throws(() => validateRecord("projects", { ...draft, published: true }), /cover/);
  assert.throws(() => validateRecord("media", { project_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", kind: "video", url: "https://example.com/file.mp4", poster_url: "", alt: "A film", caption: "", sort_order: 0 }), /poster/);
});
test("reject invalid slugs, visibility flags and display order", () => {
  assert.throws(() => validateRecord("projects", { ...draft, slug: "../admin" }), /slug/);
  assert.throws(() => validateRecord("projects", { ...draft, published: "true" }), /true or false/);
  assert.throws(() => validateRecord("projects", { ...draft, sort_order: -1 }), /non-negative/);
  assert.throws(() => validateRecord("projects", { ...draft, sort_order: 1.5 }), /non-negative/);
});
test("create valid slugs and telephone URLs", () => {
  assert.equal(slugify("My New Project!"), "my-new-project");
  assert.equal(phoneHref("+92301-4772404"), "tel:+923014772404");
});

test("collection formats and sample flags are validated without changing legacy payloads", () => {
 assert.equal(validateRecord("projects", draft).format, "web-apps");
 assert.equal(validateRecord("projects", draft).is_demo, false);
 assert.equal(validateRecord("projects", { ...draft, format: "video-ads", is_demo: true }).format, "video-ads");
 assert.throws(() => validateRecord("projects", { ...draft, format: "secret" }), /collection/);
 assert.throws(() => validateRecord("projects", { ...draft, is_demo: "true" }), /true or false/);
});


test("individual skill editing accepts content fields and rejects privilege or visibility injection", () => {
 const skill={label:"Next.js & React Development",category:"Web & App",sort_order:2,enabled:true};
 assert.equal(validateRecord("skills",skill).label,skill.label);
 assert.equal(isResource("skills"),true);
 assert.throws(()=>validateRecord("skills",{...skill,category:"Administrator"}),/skill group/);
 assert.throws(()=>validateRecord("skills",{...skill,enabled:"true"}),/true or false/);
 assert.throws(()=>validateRecord("skills",{...skill,user_id:"owner"}),/Unknown fields/);
 assert.throws(()=>validateRecord("skills",{...skill,label:""}),/required/);
});

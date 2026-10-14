import { test } from "node:test";
import assert from "node:assert/strict";
import { NavigationScrollState, navigationKey } from "../src/lib/navigation-scroll.ts";
import { lockDocumentScroll } from "../src/lib/scroll-lock.ts";
import { publicProjects } from "../src/lib/public-projects.ts";

const top = { kind: "position", position: { x: 0, y: 0 }, focusMain: true };
test("a new page link starts at top instead of inheriting the previous page bottom", () => {
  const scroll = new NavigationScrollState();
  scroll.commit("/", "home-1"); scroll.observe({ x: 0, y: 7800 });
  scroll.begin("link", "/skills", { x: 0, y: 7800 });
  scroll.observe({ x: 0, y: 900 }); // A shorter incoming page can clamp before commit.
  assert.deepEqual(scroll.commit("/skills", "skills-1"), top);
  scroll.begin("history", "/", { x: 0, y: 0 });
  assert.deepEqual(scroll.commit("/", "home-1"), { kind: "position", position: { x: 0, y: 7800 }, focusMain: false });
});
test("Back and Forward restore each history entry's own position", () => {
  const scroll = new NavigationScrollState();
  scroll.commit("/", "home-1"); scroll.observe({ x: 0, y: 3400 });
  scroll.begin("link", "/projects", { x: 0, y: 3400 }); scroll.commit("/projects", "projects-1");
  scroll.observe({ x: 0, y: 900 });
  scroll.begin("history", "/", { x: 0, y: 900 });
  assert.deepEqual(scroll.commit("/", "home-1"), { kind: "position", position: { x: 0, y: 3400 }, focusMain: false });
  scroll.begin("history", "/projects", { x: 0, y: 3400 });
  assert.deepEqual(scroll.commit("/projects", "projects-1"), { kind: "position", position: { x: 0, y: 900 }, focusMain: false });
});
test("repeated visits to the same URL do not overwrite an older entry's position", () => {
  const scroll = new NavigationScrollState();
  scroll.commit("/", "home-old"); scroll.observe({ x: 0, y: 4800 });
  scroll.begin("link", "/projects", { x: 0, y: 4800 }); scroll.commit("/projects", "projects");
  scroll.begin("link", "/", { x: 0, y: 500 }); scroll.commit("/", "home-new"); scroll.observe({ x: 0, y: 120 });
  scroll.begin("history", "/projects", { x: 0, y: 120 }); scroll.commit("/projects", "projects");
  scroll.begin("history", "/", { x: 0, y: 500 });
  assert.deepEqual(scroll.commit("/", "home-old"), { kind: "position", position: { x: 0, y: 4800 }, focusMain: false });
});
test("section links resolve their requested anchor and preserve its Back position", () => {
  const scroll = new NavigationScrollState();
  scroll.commit("/", "home");
  scroll.begin("link", "/#skills%20list", { x: 0, y: 0 });
  assert.deepEqual(scroll.commit("/#skills%20list", "anchor"), { kind: "anchor", id: "skills list", focusMain: true });
  scroll.observe({ x: 0, y: 1800 });
  scroll.begin("history", "/", { x: 0, y: 1800 });
  assert.deepEqual(scroll.commit("/", "home"), { kind: "position", position: { x: 0, y: 0 }, focusMain: false });
});
test("same-route refresh leaves scroll alone, while an explicit same-page link goes to top", () => {
  const scroll = new NavigationScrollState();
  scroll.commit("/admin", "admin"); scroll.observe({ x: 0, y: 850 });
  assert.equal(scroll.commit("/admin", "admin"), null);
  scroll.begin("link", "/admin", { x: 0, y: 850 });
  assert.deepEqual(scroll.commit("/admin", "admin"), top);
});
test("query and fragment destinations retain distinct navigation keys", () => {
  assert.equal(navigationKey(new URL("https://example.test/projects?format=web-apps#work")), "/projects?format=web-apps#work");
  const scroll = new NavigationScrollState();
  scroll.commit("/projects?format=image-ads", "images");
  scroll.begin("link", "/projects?format=video-ads", { x: 0, y: 1900 });
  assert.deepEqual(scroll.commit("/projects?format=video-ads", "video"), top);
});
test("a fresh document starts at top without a persistent seen-session gate", () => {
  assert.deepEqual(new NavigationScrollState().commit("/"), top);
  assert.deepEqual(new NavigationScrollState().commit("/contact"), top);
});
test("invalid fragment encoding never crashes navigation", () => {
  assert.deepEqual(new NavigationScrollState().commit("/#%E0"), { kind: "anchor", id: "%E0", focusMain: true });
});
test("nested intro/menu/media locks only release after the last layer closes", () => {
  const fixture = { documentElement: { style: { overflow: "clip" } }, body: { style: { overflow: "auto" } } };
  const doc = fixture as unknown as Document;
  const intro = lockDocumentScroll(doc), menu = lockDocumentScroll(doc);
  intro(); intro();
  assert.equal(fixture.documentElement.style.overflow, "hidden");
  assert.equal(fixture.body.style.overflow, "hidden");
  menu();
  assert.equal(fixture.documentElement.style.overflow, "clip");
  assert.equal(fixture.body.style.overflow, "auto");
});
test("scroll locks restore independent documents without stale overflow styles", () => {
  const first = { documentElement: { style: { overflow: "" } }, body: { style: { overflow: "" } } };
  const second = { documentElement: { style: { overflow: "auto" } }, body: { style: { overflow: "scroll" } } };
  const releaseFirst = lockDocumentScroll(first as unknown as Document);
  const releaseSecond = lockDocumentScroll(second as unknown as Document);
  releaseFirst();
  assert.equal(first.body.style.overflow, ""); assert.equal(second.body.style.overflow, "hidden");
  releaseSecond(); assert.equal(second.body.style.overflow, "scroll");
});
test("only published owner work appears publicly; drafts and seeded samples stay hidden", () => {
  const projects = [
    { id: "live", published: true, is_demo: false }, { id: "draft", published: false, is_demo: false },
    { id: "sample", published: true, is_demo: true }, { id: "sample-draft", published: false, is_demo: true },
  ];
  assert.deepEqual(publicProjects(projects).map(project => project.id), ["live"]);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { portfolioProjects } from "../src/lib/public-projects.ts";
import type { Project } from "../src/lib/types.ts";

type Example = Pick<Project, "id" | "slug" | "format" | "published" | "is_demo">;
const image: Example = { id: "image", slug: "sample-image", format: "image-ads", published: true, is_demo: true };
const video: Example = { id: "video", slug: "sample-video", format: "video-ads", published: true, is_demo: true };
test("requested examples make otherwise empty image/video collections reviewable", () => {
  assert.deepEqual(portfolioProjects([], [image, video], true), [image, video]);
  assert.deepEqual(portfolioProjects([], [image, video], false), []);
});
test("publishing owner work replaces the examples only in that work's collection", () => {
  const live = { ...image, id: "live-image", slug: "my-campaign", is_demo: false };
  assert.deepEqual(portfolioProjects([live], [image, video], true), [live, video]);
  assert.deepEqual(portfolioProjects([live], [image, video], false), [live]);
});
test("examples cannot reveal drafts or stored private sample edits", () => {
  const draft = { ...image, id: "draft", slug: "private-draft", published: false, is_demo: false };
  const privateSample = { ...video, title: "Private admin-only edit" };
  assert.deepEqual(portfolioProjects([draft, privateSample], [image, video], true), [image, video]);
  assert.deepEqual(portfolioProjects([draft, privateSample], [image, video], false), []);
});
test("converting a sample to another collection does not duplicate its ID or permalink", () => {
  const converted: Example = { ...image, format: "branding", is_demo: false };
  assert.deepEqual(portfolioProjects([converted], [image, video], true), [converted, video]);
  const sameSlug = { ...converted, id: "new-owner-id" };
  assert.deepEqual(portfolioProjects([sameSlug], [image, video], true), [sameSlug, video]);
});

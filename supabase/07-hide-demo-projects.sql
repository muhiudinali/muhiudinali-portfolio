-- Existing installation: run after the original schema and collection upgrade.
-- Keep sample records in admin, but hide them and their media from public reads.
-- The owner can publish real work by replacing content and clearing is_demo.
begin;

drop policy if exists public_read on public.projects;
create policy public_read on public.projects for select to anon, authenticated
using (published and not is_demo);

drop policy if exists public_read on public.project_media;
create policy public_read on public.project_media for select to anon, authenticated
using (exists (
  select 1 from public.projects project
  where project.id = project_id and project.published and not project.is_demo
));

-- Existing admin_read/write policies and the allowlist remain in force.
commit;

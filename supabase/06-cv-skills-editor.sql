-- Existing Supabase setup: run after the original 01 schema.
-- Full twelve-entry CV inventory with real admin add/edit/hide/delete controls.
-- Existing professional service roles are kept separately and are not changed.
begin;

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  label text not null check (length(label) between 1 and 150),
  category text not null check (category in ('AI & Creative', 'Performance Marketing', 'Web & App')),
  sort_order integer not null default 0 check (sort_order >= 0),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
create index if not exists skills_public_order_idx on public.skills (enabled, sort_order);

alter table public.skills enable row level security;
revoke all on public.skills from public, anon, authenticated;
grant select on public.skills to anon, authenticated;
grant insert, update, delete on public.skills to authenticated;
drop policy if exists public_read on public.skills;
create policy public_read on public.skills for select to anon, authenticated using (enabled);
drop policy if exists admin_read on public.skills;
create policy admin_read on public.skills for select to authenticated using ((select public.is_portfolio_admin()));
drop policy if exists admin_insert on public.skills;
create policy admin_insert on public.skills for insert to authenticated with check ((select public.is_portfolio_admin()));
drop policy if exists admin_update on public.skills;
create policy admin_update on public.skills for update to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));
drop policy if exists admin_delete on public.skills;
create policy admin_delete on public.skills for delete to authenticated using ((select public.is_portfolio_admin()));
drop trigger if exists touch_updated_at on public.skills;
create trigger touch_updated_at before update on public.skills for each row execute function portfolio_private.touch_updated_at();

-- Only initialize an empty skill list; keep owner edits/additions on reruns.
insert into public.skills (id,label,category,sort_order)
select seed.id, seed.label, seed.category, seed.sort_order from (values
('d1000000-0000-4000-8000-000000000001'::uuid,'AI Content & Creative Ads','AI & Creative',0),
('d1000000-0000-4000-8000-000000000002'::uuid,'Social Media Management & Marketing','Performance Marketing',1),
('d1000000-0000-4000-8000-000000000003'::uuid,'AI-Powered Ads & Content Creation','AI & Creative',2),
('d1000000-0000-4000-8000-000000000004'::uuid,'Logo Design & Brand Identity','AI & Creative',3),
('d1000000-0000-4000-8000-000000000005'::uuid,'SEO & Digital Marketing','Performance Marketing',4),
('d1000000-0000-4000-8000-000000000006'::uuid,'Web & AI Website Development','Web & App',5),
('d1000000-0000-4000-8000-000000000007'::uuid,'Frontend & Backend Development','Web & App',6),
('d1000000-0000-4000-8000-000000000008'::uuid,'Next.js & React Development','Web & App',7),
('d1000000-0000-4000-8000-000000000009'::uuid,'UI/UX Design','Web & App',8),
('d1000000-0000-4000-8000-000000000010'::uuid,'Graphic Design & Branding','AI & Creative',9),
('d1000000-0000-4000-8000-000000000011'::uuid,'Adobe Photoshop & Illustrator','AI & Creative',10),
('d1000000-0000-4000-8000-000000000012'::uuid,'Figma Design','Web & App',11)
) as seed(id,label,category,sort_order)
where not exists (select 1 from public.skills)
on conflict (id) do nothing;

commit;

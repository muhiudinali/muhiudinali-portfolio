-- Run FIRST in the Supabase SQL Editor of a NEW project.
-- Tables, row-level security, public portfolio storage and your real profile.
-- This file can be rerun: existing content is not overwritten by seed data.
begin;

create schema if not exists portfolio_private;
revoke all on schema portfolio_private from public, anon, authenticated;

create table if not exists portfolio_private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table portfolio_private.admin_users enable row level security;
revoke all on portfolio_private.admin_users from public, anon, authenticated;
comment on table portfolio_private.admin_users is 'SQL Editor manages the admin allowlist. App users cannot add themselves.';

create or replace function public.is_portfolio_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from portfolio_private.admin_users a
    where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  name text not null check (length(name) between 1 and 100),
  headline text not null check (length(headline) between 1 and 250),
  about text not null check (length(about) between 1 and 10000),
  email text not null check (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text not null check (length(phone) between 5 and 50),
  location text not null check (length(location) between 1 and 150),
  portrait_url text not null check (portrait_url ~ '^(https://|/[^/])'),
  updated_at timestamptz not null default now()
);
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 100),
  description text not null check (length(description) between 1 and 2000),
  icon text not null default 'sparkles' check (icon in ('sparkles', 'chart', 'code')),
  tags text[] not null default '{}',
  sort_order integer not null default 0 check (sort_order >= 0),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  label text not null check (length(label) between 1 and 150),
  category text not null check (category in ('AI & Creative', 'Performance Marketing', 'Web & App')),
  sort_order integer not null default 0 check (sort_order >= 0),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
create index if not exists skills_public_order_idx on public.skills (enabled, sort_order);

create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  company text not null check (length(company) between 1 and 150),
  role text not null check (length(role) between 1 and 150),
  duration text not null check (length(duration) between 1 and 100),
  description text not null check (length(description) between 1 and 5000),
  sort_order integer not null default 0 check (sort_order >= 0),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  qualification text not null check (length(qualification) between 1 and 200),
  status text not null check (length(status) between 1 and 150),
  sort_order integer not null default 0 check (sort_order >= 0),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null check (length(label) between 1 and 60),
  url text not null check (url ~ '^https://'),
  sort_order integer not null default 0 check (sort_order >= 0),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 150),
  slug text not null unique check (length(slug) between 1 and 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category text not null check (category in ('AI & Creative', 'Performance Marketing', 'Web & App')),
  format text not null default 'image-ads' constraint projects_format_check check (format in ('image-ads','video-ads','web-apps','branding')),
  is_demo boolean not null default false,
  summary text not null default '' check (length(summary) <= 500),
  description text not null default '' check (length(description) <= 20000),
  cover_url text check (cover_url is null or cover_url ~ '^(https://|/[^/])'),
  external_url text check (external_url is null or external_url ~ '^https://'),
  repository_url text check (repository_url is null or repository_url ~ '^https://'),
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_project_has_cover check (not published or cover_url is not null)
);
create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  url text not null check (url ~ '^(https://|/[^/])'),
  poster_url text check (poster_url is null or poster_url ~ '^(https://|/[^/])'),
  alt text not null check (length(alt) between 1 and 300),
  caption text not null default '' check (length(caption) <= 2000),
  sort_order integer not null default 0 check (sort_order >= 0),
  updated_at timestamptz not null default now(),
  constraint video_has_poster check (kind <> 'video' or poster_url is not null)
);

create index if not exists projects_public_order_idx on public.projects (published, sort_order, created_at);
create index if not exists project_media_project_order_idx on public.project_media (project_id, sort_order);

create or replace function portfolio_private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

-- All write policies re-check the SQL allowlist; no client-supplied role is trusted.
do $$
declare t text;
begin
  foreach t in array array['site_settings','services','skills','experience','education','social_links','projects','project_media'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('drop policy if exists admin_read on public.%I', t);
    execute format('create policy admin_read on public.%I for select to authenticated using ((select public.is_portfolio_admin()))', t);
    execute format('drop policy if exists admin_insert on public.%I', t);
    execute format('create policy admin_insert on public.%I for insert to authenticated with check ((select public.is_portfolio_admin()))', t);
    execute format('drop policy if exists admin_update on public.%I', t);
    execute format('create policy admin_update on public.%I for update to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()))', t);
    execute format('drop policy if exists admin_delete on public.%I', t);
    execute format('create policy admin_delete on public.%I for delete to authenticated using ((select public.is_portfolio_admin()))', t);
    execute format('drop trigger if exists touch_updated_at on public.%I', t);
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function portfolio_private.touch_updated_at()', t);
  end loop;
end $$;

drop policy if exists public_read on public.site_settings;
create policy public_read on public.site_settings for select to anon, authenticated using (true);
do $$
declare t text;
begin
  foreach t in array array['services','skills','experience','education','social_links'] loop
    execute format('drop policy if exists public_read on public.%I', t);
    execute format('create policy public_read on public.%I for select to anon, authenticated using (enabled)', t);
  end loop;
end $$;
drop policy if exists public_read on public.projects;
create policy public_read on public.projects for select to anon, authenticated using (published and not is_demo);
drop policy if exists public_read on public.project_media;
create policy public_read on public.project_media for select to anon, authenticated using (
  exists (select 1 from public.projects p where p.id = project_id and p.published and not p.is_demo)
);
-- The profile singleton is seeded; the app only updates it.
revoke insert, delete on public.site_settings from authenticated;

-- Public portfolio media. Draft database rows are private; uploaded file URLs
-- in this bucket are PUBLIC. Upload only media intended for public sharing.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media', 'portfolio-media', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists portfolio_admin_storage_select on storage.objects;
create policy portfolio_admin_storage_select on storage.objects for select to authenticated
using (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));
drop policy if exists portfolio_admin_storage_insert on storage.objects;
create policy portfolio_admin_storage_insert on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));
drop policy if exists portfolio_admin_storage_update on storage.objects;
create policy portfolio_admin_storage_update on storage.objects for update to authenticated
using (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()))
with check (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));
drop policy if exists portfolio_admin_storage_delete on storage.objects;
create policy portfolio_admin_storage_delete on storage.objects for delete to authenticated
using (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));

insert into public.site_settings (id,name,headline,about,email,phone,location,portrait_url)
values (1, 'Muhiudin Ali', 'Co-Founder of Developers Tech · Ideas into content. Clicks into growth. Code into experiences.',
  'I am the Co-Founder & Performance Marketer at Developers Tech, bringing AI content, performance marketing and full-stack development together to build digital products that scale. From creative ad campaigns and AI + UGC video production to high-converting eCommerce stores and web applications, I connect the idea, the audience and the execution.',
  'muhiudinali215@gmail.com', '+92301-4772404', 'Faisalabad, Pakistan', '/assets/portrait.png')
on conflict (id) do nothing;

insert into public.services (id,title,description,icon,tags,sort_order) values
('11111111-1111-4111-8111-111111111111','AI Content Creator','AI image and video creatives, visual storytelling, brand identity and content made for digital platforms.','sparkles',array['AI Content & Creative Ads','AI-Powered Ads & Content Creation','AI Image Ads','AI Video Ads','Logo Design & Brand Identity','Graphic Design & Branding','Adobe Photoshop','Adobe Illustrator'],0),
('22222222-2222-4222-8222-222222222222','Performance Marketer','Campaign strategy, ad creatives, audience targeting, SEO and social media marketing with performance in focus.','chart',array['Performance Marketing','Social Media Management & Marketing','SEO & Digital Marketing'],1),
('33333333-3333-4333-8333-333333333333','Web & App Developer','Responsive interfaces and useful digital products, from design in Figma to development with React and Next.js.','code',array['Web & AI Website Development','Frontend & Backend Development','Next.js','React','UI/UX Design','Figma Design'],2)
on conflict (id) do nothing;

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

insert into public.experience (id,company,role,duration,description,sort_order) values
('33333333-0000-4333-8333-111111111111','Developers Tech','Co-Founder & Performance Marketer','2024 — Present','Co-founded the software house and digital marketing agency in Faisalabad. Leading full-funnel performance marketing, Meta, Google & TikTok ad campaigns, creative strategy with AI + UGC video content, Shopify eCommerce growth, and scaling clients worldwide.',0),
('44444444-4444-4444-8444-444444444444','Vexuls Software House','Frontend Developer','1 year 2 months','Worked on international client projects, frontend and backend features, Next.js websites and AI-enabled web experiences.',1),
('55555555-5555-4555-8555-555555555555','Websoftice Agency','AI Ads Creative & Ads Runner','6 months','Created AI image and video ad creatives and worked on performance marketing campaigns.',2)
on conflict (id) do nothing;

insert into public.education (id,qualification,status,sort_order) values
('66666666-6666-4666-8666-666666666666','BS Computer Science','Currently studying',0),
('77777777-7777-4777-8777-777777777777','Intermediate · FA / IT','Completed',1),
('88888888-8888-4888-8888-888888888888','Matric · Biology','Completed',2)
on conflict (id) do nothing;

insert into public.social_links (id,label,url,sort_order) values
('99999999-9999-4999-8999-999999999991','LinkedIn','https://www.linkedin.com/in/muhiudin-ali-374b9b438',0),
('99999999-9999-4999-8999-999999999992','Instagram','https://www.instagram.com/techwithali_official/?hl=en',1),
('99999999-9999-4999-8999-999999999993','TikTok','https://www.tiktok.com/@muhiudin.ali215',2),
('99999999-9999-4999-8999-999999999994','X','https://x.com/MuhiudinAli',3),
('99999999-9999-4999-8999-999999999995','GitHub','https://github.com/muhiudinali',4)
on conflict (id) do nothing;

-- Run 04-demo-projects.sql to add the requested editable sample collections.
commit;

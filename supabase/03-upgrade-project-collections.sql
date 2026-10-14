-- Existing installations: run this once before the revised app is deployed.
-- Safe to rerun; preserves records, publishing state and Auth/RLS policies.
begin;
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='format') then
    alter table public.projects add column format text not null default 'image-ads';
    update public.projects set format='web-apps' where category='Web & App';
    update public.projects p set format='video-ads'
    where p.category <> 'Web & App'
      and exists (select 1 from public.project_media m where m.project_id=p.id and m.kind='video')
      and not exists (select 1 from public.project_media m where m.project_id=p.id and m.kind='image');
  end if;
end $$;
alter table public.projects add column if not exists is_demo boolean not null default false;
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid='public.projects'::regclass and conname='projects_format_check') then
    alter table public.projects add constraint projects_format_check check (format in ('image-ads','video-ads','web-apps','branding'));
  end if;
end $$;
commit;

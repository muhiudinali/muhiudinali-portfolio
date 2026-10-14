// Runs the REAL migration against PostgreSQL in WASM. Local auth/storage stubs
// model the roles used by Supabase; this does not connect to a live project.
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db = new PGlite();
const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const member = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let checks = 0;
function ok(value, label) { assert.ok(value, label); checks++; console.log(`PASS ${label}`); }
async function denied(query, args, label) { await assert.rejects(db.query(query, args)); checks++; console.log(`PASS ${label}`); }
async function as(role, uid = '') {
  await db.exec(`reset role; set role ${role};`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid]);
}
await db.exec(`
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users(id uuid primary key, email text unique);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
create schema storage;
create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated;
grant select, insert, update, delete on storage.objects to anon, authenticated;
insert into auth.users values ('${owner}', 'muhiudinali215@gmail.com'), ('${member}', 'member@example.com');
`);
const migration = await readFile(new URL('../supabase/01-schema-and-seed.sql', import.meta.url), 'utf8');
await db.exec(migration);
await db.exec(await readFile(new URL('../supabase/02-create-admin.sql', import.meta.url), 'utf8'));
ok((await db.query('select count(*)::int as n from portfolio_private.admin_users')).rows[0].n === 1, 'bootstrap adds exactly the selected owner');
await db.exec(migration);
ok((await db.query('select count(*)::int as n from public.services')).rows[0].n === 3, 'migration rerun preserves seed identities');

const fixtures = {
  skills: { label: 'Private CV skill', category: 'Web & App', enabled: false },
  services: { title: 'Private skill', description: 'An unpublished service', icon: 'code', tags: ['TypeScript'], enabled: false },
  experience: { company: 'Private company', role: 'Developer', duration: '1 month', description: 'Private experience', enabled: false },
  education: { qualification: 'Private course', status: 'Ongoing', enabled: false },
  social_links: { label: 'Private social', url: 'https://example.com/profile', enabled: false },
  projects: { title: 'Private project', slug: 'private-project', category: 'Web & App', cover_url: 'https://example.com/cover.png', published: false },
};
const ids = {};
for (const [table, row] of Object.entries(fixtures)) {
  await as('authenticated', owner);
  const cols = Object.keys(row), values = Object.values(row);
  const insert = `insert into public.${table} (${cols.join(',')}) values (${cols.map((_, i) => '$' + (i + 1)).join(',')}) returning id`;
  ids[table] = (await db.query(insert, values)).rows[0].id;
  ok(!!ids[table], `admin can create ${table}`);
  await as('anon');
  ok((await db.query(`select * from public.${table} where id = $1`, [ids[table]])).rows.length === 0, `anon cannot see hidden ${table}`);
  await denied(insert, values, `anon cannot insert ${table}`);
  await denied(`update public.${table} set sort_order = 9 where id = $1`, [ids[table]], `anon cannot update ${table}`);
  await denied(`delete from public.${table} where id = $1`, [ids[table]], `anon cannot delete ${table}`);
  await as('authenticated', member);
  await denied(insert, values, `non-admin cannot insert ${table}`);
  ok((await db.query(`update public.${table} set sort_order = 9 where id = $1 returning id`, [ids[table]])).rows.length === 0, `non-admin cannot update ${table}`);
  ok((await db.query(`delete from public.${table} where id = $1 returning id`, [ids[table]])).rows.length === 0, `non-admin cannot delete ${table}`);
  await as('authenticated', owner);
  ok((await db.query(`update public.${table} set sort_order = 7 where id = $1 returning id`, [ids[table]])).rows.length === 1, `admin can update ${table}`);
}

await as('authenticated', owner);
const mediaId = (await db.query("insert into public.project_media(project_id,kind,url,alt) values($1,'image','https://example.com/image.png','A real creative') returning id", [ids.projects])).rows[0].id;
ok(!!mediaId, 'admin creates gallery media');
await as('anon');
ok((await db.query('select * from public.project_media')).rows.length === 0, 'draft gallery media is not public');
await denied("insert into public.project_media(project_id,kind,url,alt) values($1,'image','https://example.com/a.png','Image')", [ids.projects], 'anon cannot insert gallery media');
await as('authenticated', member);
await denied("insert into public.project_media(project_id,kind,url,alt) values($1,'image','https://example.com/a.png','Image')", [ids.projects], 'non-admin cannot insert gallery media');
ok((await db.query("update public.project_media set alt='Hacked' where id=$1 returning id", [mediaId])).rows.length === 0, 'non-admin cannot update media');
ok((await db.query('delete from public.project_media where id=$1 returning id', [mediaId])).rows.length === 0, 'non-admin cannot delete media');
await as('authenticated', owner);
await db.query('update public.projects set published=true where id=$1', [ids.projects]);
await as('anon');
ok((await db.query('select * from public.projects')).rows.length === 1, 'published project becomes public');
ok((await db.query('select * from public.project_media')).rows.length === 1, 'published project gallery becomes public');
ok((await db.query('select public.is_portfolio_admin() as allowed')).rows[0].allowed === false, 'anonymous admin check is false');
await denied('select * from portfolio_private.admin_users', [], 'anonymous cannot read admin allowlist');
await denied('insert into portfolio_private.admin_users(user_id) values($1)', [member], 'anonymous cannot self-promote');
await denied("update public.site_settings set name='Hacked' where id=1", [], 'anonymous cannot edit profile');
await as('authenticated', member);
ok((await db.query('select public.is_portfolio_admin() as allowed')).rows[0].allowed === false, 'non-admin check is false');
await denied('insert into portfolio_private.admin_users(user_id) values($1)', [member], 'authenticated user cannot self-promote');
ok((await db.query("update public.site_settings set name='Hacked' where id=1 returning id")).rows.length === 0, 'non-admin cannot edit profile');
await as('authenticated', owner);
ok((await db.query('select public.is_portfolio_admin() as allowed')).rows[0].allowed === true, 'allowlisted owner is an admin');
ok((await db.query("update public.site_settings set headline='A real update' where id=1 returning id")).rows.length === 1, 'admin edits profile');
await denied("insert into public.site_settings(id,name,headline,about,email,phone,location,portrait_url) values(1,'X','X','X','a@b.com','12345','X','/a.png')", [], 'admin API cannot replace profile singleton');
await denied('delete from public.site_settings where id=1', [], 'admin API cannot delete profile singleton');
ok((await db.query("update public.project_media set caption='Updated' where id=$1 returning id", [mediaId])).rows.length === 1, 'admin updates media');

const objectId = (await db.query("insert into storage.objects(bucket_id,name) values('portfolio-media','test.png') returning id")).rows[0].id;
ok(!!objectId, 'admin can upload to portfolio bucket');
await denied("insert into storage.objects(bucket_id,name) values('other-bucket','test.png')", [], 'admin policy cannot write to another bucket');
await as('anon');
await denied("insert into storage.objects(bucket_id,name) values('portfolio-media','bad.png')", [], 'anonymous storage upload denied');
await as('authenticated', member);
await denied("insert into storage.objects(bucket_id,name) values('portfolio-media','bad.png')", [], 'non-admin storage upload denied');
ok((await db.query("update storage.objects set name='bad.png' where id=$1 returning id", [objectId])).rows.length === 0, 'non-admin cannot change uploaded files');
ok((await db.query('delete from storage.objects where id=$1 returning id', [objectId])).rows.length === 0, 'non-admin cannot delete uploaded files');
await as('authenticated', owner);
ok((await db.query("update storage.objects set name='new.png' where id=$1 returning id", [objectId])).rows.length === 1, 'admin can update uploaded files');
ok((await db.query('delete from storage.objects where id=$1 returning id', [objectId])).rows.length === 1, 'admin can remove uploaded files');
ok((await db.query('delete from public.project_media where id=$1 returning id', [mediaId])).rows.length === 1, 'admin can delete gallery media');
await db.query("insert into public.project_media(project_id,kind,url,alt) values($1,'image','https://example.com/image.png','Image')", [ids.projects]);
for (const [table, id] of Object.entries(ids)) ok((await db.query(`delete from public.${table} where id=$1 returning id`, [id])).rows.length === 1, `admin can delete ${table}`);
ok((await db.query('select * from public.project_media')).rows.length === 0, 'project delete cascades to gallery records');
await db.exec('reset role;');
await db.query('delete from portfolio_private.admin_users where user_id=$1', [owner]);
await as('authenticated', owner);
ok((await db.query('select public.is_portfolio_admin() as allowed')).rows[0].allowed === false, 'revoking the allowlist removes admin rights immediately');
await denied("insert into public.projects(title,slug,category) values('Denied','denied','Web & App')", [], 'revoked owner cannot write');

/* Collection upgrade and requested sample data: exercise the actual SQL. */
await db.exec('reset role;');
await db.exec(`
drop policy public_read on public.project_media;
drop policy public_read on public.projects;
alter table public.projects drop column format;
alter table public.projects drop column is_demo;
create policy public_read on public.projects for select to anon, authenticated using (published);
create policy public_read on public.project_media for select to anon, authenticated using (exists (select 1 from public.projects p where p.id=project_id and p.published));
`);
await db.exec(`
insert into public.projects(id,title,slug,category,cover_url) values
('c1000000-0000-4000-8000-000000000001','Existing web','existing-web','Web & App','/assets/one.png'),
('c1000000-0000-4000-8000-000000000002','Existing video','existing-video','AI & Creative','/assets/two.png'),
('c1000000-0000-4000-8000-000000000003','Existing image','existing-image','AI & Creative','/assets/three.png');
insert into public.project_media(project_id,kind,url,poster_url,alt) values
('c1000000-0000-4000-8000-000000000002','video','/assets/sample.mp4','/assets/poster.png','Existing video');
`);
const upgrade=await readFile(new URL('../supabase/03-upgrade-project-collections.sql',import.meta.url),'utf8');
const samples=await readFile(new URL('../supabase/04-demo-projects.sql',import.meta.url),'utf8');
const hideSamples=await readFile(new URL('../supabase/07-hide-demo-projects.sql',import.meta.url),'utf8');
await db.exec(upgrade);
const legacy=(await db.query("select slug,format,is_demo from public.projects order by slug")).rows;
ok(legacy.find(p=>p.slug==='existing-web').format==='web-apps','upgrade preserves and classifies existing web projects');
ok(legacy.find(p=>p.slug==='existing-video').format==='video-ads','upgrade classifies video-only existing galleries');
ok(legacy.every(p=>p.is_demo===false),'existing owner content is never marked as sample work');
await db.exec("update public.projects set format='branding' where slug='existing-image'");
await db.exec(upgrade);
ok((await db.query("select format from public.projects where slug='existing-image'")).rows[0].format==='branding','upgrade rerun preserves owner collection choices');
await db.exec(samples);
ok((await db.query("select count(*)::int n from public.projects where is_demo")).rows[0].n===6,'sample seed adds six labelled project records');
ok((await db.query("select count(*)::int n from public.project_media where project_id::text like 'f1000000-%'")).rows[0].n===24,'sample seed adds the 24 image/video gallery records');
await db.exec(samples);
ok((await db.query("select count(*)::int n from public.projects where is_demo")).rows[0].n===6,'sample seed rerun does not duplicate projects');
await db.exec(hideSamples);
await as('anon');
ok((await db.query("select count(*)::int n from public.projects")).rows[0].n===0,'samples and existing drafts stay hidden from public project reads');
await denied("update public.projects set is_demo=false where slug='demo-image-ads'",[],'anonymous callers cannot convert sample records');
await as('authenticated',member);
ok((await db.query("update public.projects set format='branding' where slug='demo-image-ads' returning id")).rows.length===0,'non-admin callers cannot change collection membership');
await db.exec('reset role;');
await db.exec(await readFile(new URL('../supabase/02-create-admin.sql',import.meta.url),'utf8'));
await as('authenticated',owner);
ok((await db.query("update public.projects set title='My own creative work',is_demo=false,format='branding' where slug='demo-image-ads' returning id")).rows.length===1,'admin can replace a sample and choose its real collection');
await denied("update public.projects set format='invalid' where slug='demo-image-ads'",[],'database rejects invalid collection types');
await db.exec('reset role;');
await db.exec("delete from public.project_media where id='f2000000-0000-4000-8000-000000000101'");
await db.exec(samples);
ok((await db.query("select title,is_demo,format from public.projects where slug='demo-image-ads'")).rows[0].title==='My own creative work','sample seed never overwrites owner edits');
ok((await db.query("select count(*)::int n from public.project_media where id='f2000000-0000-4000-8000-000000000101'")).rows[0].n===0,'converted real projects receive no recreated sample media');

/* CV skill update: preserve role records and custom content across reruns. */
await db.exec('reset role;');
await db.exec(`
update public.services set tags=array['Photoshop','Illustrator','Branding','Owner-added skill'] where id='11111111-1111-4111-8111-111111111111';
update public.services set tags=array['Next.js','React','UI / UX','Figma'] where id='33333333-3333-4333-8333-333333333333';
insert into public.services(id,title,description,icon,tags,sort_order,enabled) values
('c3000000-0000-4000-8000-000000000001','Owner custom role','Keep this text','code',array['Owner custom tool'],17,false);
`);
const beforeSkills=(await db.query('select id,title,description,icon,sort_order,enabled from public.services order by id')).rows;
const skillUpdate=await readFile(new URL('../supabase/05-update-cv-skills.sql',import.meta.url),'utf8');
await db.exec(skillUpdate);
const afterSkills=(await db.query('select id,title,description,icon,sort_order,enabled from public.services order by id')).rows;
ok(JSON.stringify(beforeSkills)===JSON.stringify(afterSkills),'CV update preserves role names, descriptions, icons, order and visibility');
const skillsRows=(await db.query('select id,title,tags from public.services order by id')).rows;
const allSkills=skillsRows.flatMap(s=>s.tags);
ok(['AI Content & Creative Ads','AI-Powered Ads & Content Creation','AI Image Ads','AI Video Ads','Logo Design & Brand Identity','Graphic Design & Branding','Adobe Photoshop','Adobe Illustrator','Performance Marketing','Social Media Management & Marketing','SEO & Digital Marketing','Web & AI Website Development','Frontend & Backend Development','Next.js','React','UI/UX Design','Figma Design'].every(s=>allSkills.includes(s)),'CV update includes every creative, marketing and development skill');
ok(['AI Content Creator','Performance Marketer','Web & App Developer'].every(t=>skillsRows.some(s=>s.title===t)),'CV update retains all three professional roles');
ok(skillsRows.find(s=>s.id==='11111111-1111-4111-8111-111111111111').tags.includes('Owner-added skill'),'CV update retains owner-added tags');
ok(!allSkills.includes('Photoshop') && !allSkills.includes('UI / UX') && !allSkills.includes('Figma'),'CV update normalizes old tool spellings without duplicate aliases');
ok(JSON.stringify(skillsRows.find(s=>s.id==='c3000000-0000-4000-8000-000000000001').tags)===JSON.stringify(['Owner custom tool']),'CV update leaves owner-created roles untouched');
await db.exec(skillUpdate);
ok(JSON.stringify((await db.query('select id,title,tags from public.services order by id')).rows)===JSON.stringify(skillsRows),'CV update rerun is idempotent');

/* Existing setup upgrade to the dedicated editable CV inventory. */
await db.exec('reset role; drop table public.skills;');
const skillEditorMigration=await readFile(new URL('../supabase/06-cv-skills-editor.sql',import.meta.url),'utf8');
await db.exec(skillEditorMigration);
ok((await db.query('select count(*)::int n from public.skills')).rows[0].n===12,'existing setup gets all twelve exact CV skill entries');
await as('authenticated',owner);
ok((await db.query("update public.skills set label='My edited skill',enabled=false where id='d1000000-0000-4000-8000-000000000001' returning label")).rows[0].label==='My edited skill','owner edits and hides an individual CV skill');
await as('anon');
ok((await db.query("select * from public.skills where id='d1000000-0000-4000-8000-000000000001'")).rows.length===0,'hidden CV skills do not appear in anonymous portfolio reads');
await denied("insert into public.skills(label,category) values('Injected skill','Web & App')",[],'anonymous caller cannot add CV skills');
await as('authenticated',member);
ok((await db.query("update public.skills set label='Injected' where id='d1000000-0000-4000-8000-000000000002' returning id")).rows.length===0,'non-admin cannot edit CV skills after existing-schema migration');
await denied("insert into public.skills(label,category) values('Injected skill','Web & App')",[],'non-admin cannot add CV skills after existing-schema migration');
await as('authenticated',owner);
const addedSkill=(await db.query("insert into public.skills(label,category,sort_order) values('Owner-added skill','Web & App',20) returning id")).rows[0].id;
ok(!!addedSkill,'owner adds a new independent skill');
await db.exec('reset role;');
await db.exec(skillEditorMigration);
ok((await db.query("select label,enabled from public.skills where id='d1000000-0000-4000-8000-000000000001'")).rows[0].label==='My edited skill','skill inventory migration rerun preserves owner edits');
ok((await db.query('select count(*)::int n from public.skills')).rows[0].n===13,'skill inventory migration rerun keeps additions without duplicates');
await as('authenticated',owner);
ok((await db.query('delete from public.skills where id=$1 returning id',[addedSkill])).rows.length===1,'owner deletes an individual skill');
await db.exec('reset role;');
await db.exec(skillEditorMigration);
ok((await db.query('select * from public.skills where id=$1',[addedSkill])).rows.length===0,'skill inventory migration does not recreate deleted owner additions');

/* Upgrade existing public-read policies to hide demo records and their media. */
await db.exec('reset role;');
await db.exec("drop policy public_read on public.projects; create policy public_read on public.projects for select to anon, authenticated using (published);");

await db.exec(hideSamples);
await as('anon');
ok((await db.query('select * from public.projects where is_demo')).rows.length===0,'demo visibility upgrade hides every sample from anonymous project reads');
ok((await db.query("select * from public.project_media where project_id in (select id from public.projects where is_demo)")).rows.length===0,'sample gallery metadata is not publicly accessible');
ok((await db.query("select * from public.project_media where project_id in ('f1000000-0000-4000-8000-000000000002','f1000000-0000-4000-8000-000000000003')")).rows.length===0,'sample media cannot be read directly by known project IDs');
ok((await db.query("select title from public.projects where slug='demo-image-ads'")).rows[0].title==='My own creative work','converted published owner work remains visible');
await as('authenticated',owner);
ok((await db.query('select * from public.projects where is_demo')).rows.length===5,'allowlisted owner still sees samples for real admin editing');
await db.exec('reset role;');
await db.exec(hideSamples);
await as('authenticated',owner);
ok((await db.query("update public.projects set summary='Edited in admin' where slug='demo-social-creatives' returning id")).rows.length===1,'demo visibility upgrade keeps admin editing rights after rerun');
await db.exec('reset role;');

await db.close();
console.log(`\n${checks} database security checks passed. Supabase Auth/Storage service integration requires your project setup.`);

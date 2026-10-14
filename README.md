# Muhiudin Ali — Portfolio + Admin

A real Next.js App Router project with TypeScript, Supabase Auth, PostgreSQL RLS and Supabase Storage. Prepared for your own Vercel deployment.

**Start with [SETUP.md](SETUP.md).** It contains the complete setup steps in Roman Urdu.

## Included

- Approved warm beige `#EDECE6`, cobalt blue `#1546D9` and sun yellow `#F9B318` design.
- Your approved transparent portrait, used directly.
- Full Home, About, Skills, Services, My Projects, Journey and Contact pages, with separate service details, project collections and project details.
- All five approved social links, email and phone, with their contact marks in the closing cursor animation.
- Skills navigation, a dedicated `/skills` page and the full CV skill inventory under the three preserved professional roles.
- Floating three-line menu navigation; the horizontal header strip is removed.
- Six approved motion interactions; the latest Video 1 gallery is used for collection work and the Skills Video Ads section, while Video 2 showcase is exclusive to /projects.
- Tall condensed Anton for all website headings; clean DM Sans for paragraphs and simple text.
- Real `/admin` editor with email/password login, password change and recovery; all saves use the protected Supabase API.
- Add/edit/delete projects and gallery images/videos; drafts, publishing, categories, display order and featured projects.
- Edit profile, portrait, contact information, social links, individual CV skills, service roles, experience and education.
- Direct authenticated uploads to Supabase Storage.
- SQL for every content table, the admin allowlist, storage policies and the initial content.
- Six labelled local sample projects, 24 media items and three playable clips. Empty collections show these examples by default; published real work replaces examples in its collection. PORTFOLIO_SHOW_SAMPLES=false hides the local examples.
- Retained double-stairs intro on every full page load, seamless responsive ribbon, portrait axis motion and controlled page/section scrolling.
- Collection categories/counts/links are integrated into the existing Projects filters; the duplicate collection grid is removed.

## Run locally

Use Node.js 22.18+ or Node.js 24 LTS and npm. Next.js runs without Supabase credentials for design development using your initial CV/profile content. The requested dummy projects appear in empty collections by default. Admin editing requires the configured Supabase project and SQL setup.

```bash
npm ci
cp .env.example .env.local
# Edit .env.local with your own project values.
npm run dev
```

Open `http://localhost:3000`. Admin: `http://localhost:3000/admin`.

**Design review:** open `http://localhost:3000/projects` for Video 2 and `http://localhost:3000/skills#video-ads` for Video 1. All collection pages have assembled gallery media, without Supabase setup. Read [PAGES.md](PAGES.md) for all routes and SQL order, and [REVISION.md](REVISION.md) for this update. Real admin login: `http://localhost:3000/admin`. The former admin preview URL redirects to the real editor. Actual database work must be published with Sample project unchecked. Local labelled examples fill otherwise empty collections; `/preview` remains an explicit homepage design review; the sample SQL seed keeps those records editable in admin. Existing Supabase installations must run `07-hide-demo-projects.sql` for the updated read permissions.

```bash
npm run typecheck
npm test
npm run test:database
npm run build
npm start
```

## Source map

| Path | Purpose |
| --- | --- |
| `src/app/page.tsx` / `src/components/portfolio.tsx` | Public homepage and layered content scenes |
| `src/app/preview/page.tsx` | Design/motion review with generated realistic sample photos |
| `src/components/scroll-scene.tsx` | Continuous, reversible multi-layer scroll transforms |
| `src/components/hero.tsx` | Portrait hero and scroll parallax |
| `src/components/motion.tsx` | Document entry loader and contact logo cursor trail |
| `src/components/discipline-ribbon.tsx` | Measured, gap-free repeating service ribbon |
| `src/components/navigation-scroll.tsx` | Page-top/anchor navigation and history scroll restoration |
| `src/lib/scroll-lock.ts` | Shared, nested document scroll locking |
| `src/components/skills.tsx` | Skills hover/tap and letter animation |
| `src/components/projects.tsx` | Video 2 shared image/title transitions, exclusive to /projects |
| `src/components/project-index.tsx` | Home project composition with ordinary detail links |
| `src/components/collection-gallery.tsx` | Assemble collection media for Video 1 galleries |
| `ANTIGRAVITY-HANDOFF.md` | Latest font/motion locks, dummy-content edit map and review links |
| `src/components/media-gallery.tsx` | Expanding gallery and image/video viewer |
| `src/app/projects/[slug]/page.tsx` | Direct, shareable published project pages |
| `src/components/admin/` | Dashboard, forms, uploads and content editing |
| `src/app/api/admin/content/[resource]/route.ts` | Validated admin mutations |
| `src/lib/auth.ts` | Server-verified user and admin allowlist checks |
| `src/proxy.ts` | Supabase cookie session refresh for admin routes |
| `src/lib/data.ts` | Anonymous reads of published non-sample work |
| `supabase/01-schema-and-seed.sql` | All tables, RLS, storage and initial profile |
| `supabase/02-create-admin.sql` | Explicit owner account allowlist setup |
| `supabase/03-upgrade-project-collections.sql` | Upgrade existing records for collection types and sample labels |
| `supabase/04-demo-projects.sql` | Six editable sample projects and their media |
| `supabase/05-update-cv-skills.sql` | Preserve/extend the older role-related tags |
| `supabase/06-cv-skills-editor.sql` | Add the dedicated 12-entry CV skill list and real admin permissions to an existing installation |
| `supabase/07-hide-demo-projects.sql` | Hide sample project/media records from public reads while preserving admin editing |
| `CV_SKILLS.md` | Exact twelve-entry CV skill inventory and preserved professional roles |
| `src/lib/contact-platforms.ts` | Maps the supplied contact URLs to local platform logos |
| `SKILLS_UPDATE.md` | This revision and the short existing-site SQL step |
| `scripts/verify-pages.mjs` | Server rendering, internal links and asset audit |
| `scripts/test-database.mjs` | Actual PostgreSQL permission tests in PGlite |
| `ANIMATIONS.md` | Locked animation mapping and implementation notes |
| `VERIFICATION.md` | Completed checks and verification limits |

## Data and security

Passwords are managed by Supabase Auth, not stored in a custom password table. The separate `portfolio_private.admin_users` allowlist can only be managed in SQL Editor. Every admin mutation verifies the user on the server and the database independently enforces RLS. The public homepage uses an anonymous client even if an admin is signed in.

Only published, non-sample database project records and their gallery records are publicly readable. The requested labelled local template examples are separate bundled assets. The `portfolio-media` bucket is public because it serves portfolio media. An uploaded file URL is public even when its project is still a draft. Only upload media intended for public sharing. Deleting a content record removes its database references; Storage files remain for manual cleanup, so shared assets are not accidentally deleted.

No public admin navigation or public account registration is provided. `/admin` is a login-protected route; its path can be known without granting access. The route is also marked `noindex`.

## Assets

Typography follows the latest owner lock: local Anton for every website heading and DM Sans 400/700 for readable paragraphs, labels and interface text. Font licenses are in public/fonts/. The earlier serif heading pairing is superseded; the retained serif asset is unused.

The approved transparent portrait is retained byte-for-byte. Four photorealistic images were generated for product creatives, marketing, web/app development and branding, replacing the former cartoon artwork throughout public pages and sample projects. The sample video files are silent six-second camera-motion studies of these photos. They are labelled examples, not client work. Contact animation continues to use platform marks rather than project photos.

Old local illustration URLs redirect to their corresponding generated photograph so existing Supabase sample records remain viewable after redeployment. No old cartoon images are shipped. Contact brand source/license metadata is in `public/assets/contact-logos/`.

The archive excludes dependencies, build output and real environment credentials. `package-lock.json` is included for reproducible installation.

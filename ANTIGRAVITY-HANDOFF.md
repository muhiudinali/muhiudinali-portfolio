# Portfolio handoff — 13 October 2026

## Current approved direction

Muhiudin Ali portfolio, Next.js + Supabase, for the owner's Vercel deployment.
Colours: warm beige #EDECE6, cobalt blue #1546D9, sun yellow #F9B318.
Use the original public/assets/portrait.png and its existing upper-body crop.
Keep the three-line menu, loader, scroll scenes, contact platform logos, full CV skills and actual /admin editor.

## Font lock

- All website headings: tall condensed Anton, local PortfolioDisplay font.
- Paragraphs, simple labels and controls: DM Sans, local PortfolioSans 400/700.
- Admin controls retain the readable DM Sans interface.
- src/app/globals.css defines the fonts. The earlier serif pairing is superseded.

## Exact reference placement

| Owner's video | Reference | Approved placement |
| --- | --- | --- |
| Video 1 | ExpandOnHover | /skills#video-ads and collection work; hover/focus/tap expands one poster, Play opens that clip |
| Video 2 | Projects Showcase | Only /projects; corner image/title move to centred inline details and reverse on Back |

Collection pages use one assembled media gallery, followed by direct project detail links. They do not use the Projects Showcase transition. Home keeps the existing corner layout with ordinary detail links.
A03 scroll, A04 start, A05 skill-role hover and A06 contact-logo trail remain in their existing places.

## Main files

| File | Edit here for |
| --- | --- |
| src/components/projects.tsx | Video 2 shared-cover/title sequence on /projects |
| src/components/project-index.tsx | Home's normal project detail links |
| src/components/collection-gallery.tsx | Assemble collection media from project records |
| src/components/media-gallery.tsx | Video 1 expanding cards and media viewer |
| src/components/portfolio.tsx | VideoAdsSection and existing page sections |
| src/app/skills/page.tsx | Video Ads work section inside Skills |
| src/lib/demo-projects.ts | Six dummy project names, media, covers and descriptions |
| src/lib/public-projects.ts | Add local examples only to collections without real published work |
| src/lib/data.ts | Anonymous Supabase reads and local example mode |
| src/app/globals.css | Global heading/body fonts and layout styles |

## Dummy work replace karna

Six projects / 24 media items / three silent playable sample clips included hain.
Template default mein labelled local examples empty collections mein dikhati hai.
Antigravity se src/lib/demo-projects.ts mein title, slug, format, cover, description aur media replace kar sakte ho. New files public/assets mein add karo aur URLs update karo.

Configured Supabase par /admin se bhi apna actual work publish kar sakte ho. Sample project untick + Publish tick karo. Us collection ka real work aane par local examples automatically hat jaate hain.
Database drafts aur private sample edits public visitors ko expose nahi hote. Local examples independent bundled assets hain.
Saare local examples hide karne ke liye PORTFOLIO_SHOW_SAMPLES=false set karo; environment change ke baad restart/redeploy karo.

## Review

npm ci
npm run dev

- /projects: Video 2, hover → open → back.
- /skills#video-ads: Video 1, poster expand → play.
- /projects/collections/video-ads: assembled video collection.
- Other collection pages: image/web/brand galleries and detail links.
- Home refresh: retained stairs intro and continuous ribbon.

Before delivery: npm run typecheck; npm test; node scripts/verify-pages.mjs; npm run build.
Live desktop/mobile motion and hosted Supabase saves/uploads still need browser review.

# Pages aur review guide

Yeh edition poori multi-page Next.js website hai. Three-line menu ke links apne pages open karte hain. Horizontal navbar strip remove kar di gayi hai.

| URL | Kya dikhata hai | Motion |
| --- | --- | --- |
| / | Full portfolio homepage; normal project detail links | A03 + A04 + A05 + A06 |
| /about | Personal intro, bigger portrait, approach, experience/education | A03 |
| /skills | Full CV skills, role selectors and Video Ads work gallery | A02 + A05 + A03 |
| /services | Service overview aur detailed service cards | A05 + A03 |
| /services/ai-content-creation | AI content service | A05 + A03 |
| /services/performance-marketing | Marketing service | A05 + A03 |
| /services/web-app-development | Web/app service | A05 + A03 |
| /projects | My Projects list, hover previews aur open/back detail view | A01 + A02 + A03 |
| /projects/collections/image-ads | Separate image-ad collection | A02 + A03 |
| /projects/collections/video-ads | Separate video-ad collection | A02 + A03 |
| /projects/collections/web-apps | Separate web/app collection | A02 + A03 |
| /projects/collections/branding | Separate branding collection | A02 + A03 |
| /projects/PROJECT_SLUG | Shareable full project detail page | A02 + A03 |
| /journey | Full experience, education aur skills page | A03 |
| /contact | Portrait, email/phone/socials aur closing contact interaction | A06 + A03 |
| /admin | Login-protected content workspace | Functional admin |
| /admin/preview | Old link redirects to the real /admin editor | Compatibility redirect |
| /preview | Homepage design review with labelled examples | A03 + A04 + A05 + A06 |

A04 Double Stairs intro har full page load/refresh par play hota hai; us document ke andar normal page navigation par repeat nahi hota. Round menu aur scroll-position rail har public page par hain.

## Pehle design dekho

```bash
npm ci
npm run dev
```

Browser mein http://localhost:3000 open karo. Saare menu pages aur collections browse karo. Real admin ke liye http://localhost:3000/admin open karo. Sample design `/preview` par Supabase keys ke baghair dekh sakte ho; requested local dummy projects empty collections mein default se visible hain; editing aur saving configured Supabase login ke baad hoti hai.

6 clearly labelled dummy projects, 24 media records aur 3 playable six-second sample clips included hain. Samples generated realistic photos aur photo-motion studies hain; koi fake client, result ya testimonial claim nahi hai.

Approved portrait ab website par larger upper-body / roughly half-body close-up framing mein use hoti hai. Crop CSS containers se hota hai, is liye original face/file retain rehta hai.

## Admin se apna content lagao

Supabase setup ke baad /admin login karo. Existing sample project edit karo, apna title/description/cover aur media lagao, Collection page choose karo aur Sample project checkbox untick karo aur Publish tick karo. Is se project aur uski gallery public hongi. Ya sample delete karke new project add karo.

Default three services ke detail URLs stable hain. Agar naya service add karte ho, uska distinct detail URL service ID se banega aur site ke service cards us par link karenge. Service title, description aur tags admin se update hote hain.

## SQL order

**Naya Supabase project:** 01-schema-and-seed.sql → Auth user create → 02-create-admin.sql → 04-demo-projects.sql.

**Pehle se setup hai:** 03-upgrade-project-collections.sql run karo. Dummy work chahiye to 04-demo-projects.sql bhi run karo. Full CV skills ke individual editor ke liye 06-cv-skills-editor.sql run karo. Older service-related tags update karne ke liye 05 optional hai. Database sample rows private rakhne ke liye **07-hide-demo-projects.sql** run karo. Agar 03/06 already run hain to unhein repeat karne ki zaroorat nahi: sirf 07 run karo, phir revised code deploy karo.

03 existing records aur collection choices preserve karti hai. 04 seed rerun par existing titles/media edits overwrite nahi karti; Sample project untick kar chuke record mein deleted sample media recreate nahi hoti.

Detailed keys, Auth URLs, uploads aur Vercel steps SETUP.md mein hain.

Browser mein desktop/mobile animation timing, keyboard focus aur actual Supabase login/uploads ka review abhi required hai. Build, server rendering, navigation aur SQL checks pass hain.

Old `/expertise` URLs redirect permanently to `/skills`. Contact animation mein project pictures ki jagah LinkedIn, Instagram, TikTok, X, GitHub, email aur phone marks use hote hain.

**Skills tab:** CV ke 12 entries alag records hain—add, edit, hide, reorder aur delete ho sakte hain. **Services & Roles tab:** AI Content Creator, Performance Marketer aur Web & App Developer ki descriptions aur related tags separately edit hote hain.

## Motion aur navigation cleanup

- Ribbon measured text copies se continuous chalti hai; desktop, mobile aur admin-edited titles par trailing blank gap nahi banta.
- Photo ke peeche do orbit lines different axes/rates par move karti hain; portrait file unchanged hai.
- Explore by collection ki extra card grid removed hai. Uski category/count/detail-page links Projects filters mein hain.
- Naya page top par khulta hai. Section links apne section par jaate hain; Back/Forward remembered position restore karta hai.
- Menu/media focus preventScroll use karta hai; shared nested scroll locks aur disabled scroll anchoring footer jumps rokne ke liye hain.

## 13 October font aur placement lock

Headings har public page par Anton; paragraphs/simple text DM Sans.
Video 1 ExpandOnHover /skills#video-ads aur collections mein; Video 2 Projects Showcase sirf /projects par.
Local examples src/lib/demo-projects.ts se edit karo. Real published work apni collection ke examples replace karta hai. Sab examples hide karne ke liye PORTFOLIO_SHOW_SAMPLES=false.
Antigravity editing map ANTIGRAVITY-HANDOFF.md mein hai.

# Setup — Supabase + Vercel

Yeh poora Next.js source project hai. Pehle Supabase configure karo, phir GitHub/Vercel par deploy karo. Naye project ke liye SQL order **01 → Auth user → 02 → 04** hai. **Agar pehle wali website ka Supabase setup already hai**, pehle `03-upgrade-project-collections.sql` run karo; dummy collections ke liye `04-demo-projects.sql` run karo, individual CV skill editor ke liye `06-cv-skills-editor.sql` run karo; older related-service tags update ke liye 05 optional hai; database sample rows private rakhne ke liye **07-hide-demo-projects.sql** run karo; phir revised code deploy karo. Agar 03 aur 06 already applied hain to is update mein sirf 07 run karni hai.

Tumne “neon key” likha tha: is code mein **Supabase ki publishable key ya legacy anon key** use hoti hai. Neon ki key/connection string is integration ka hissa nahi hai. Supabase ka database password bhi environment variable mein nahi dena.

## 1. Zip extract karo

Zip extract karne par `muhiudin-portfolio-nextjs` folder milega. Is folder ke andar `package.json`, `src`, `public` aur `supabase` hain.

Apne computer par Node.js 22.18+ ya Node.js 24 LTS install karo. Terminal isi folder mein open karo:

```bash
npm ci
```

## 2. Supabase project banao

1. [Supabase Dashboard](https://supabase.com/dashboard) mein naya project create karo.
2. Database password apne paas save karo. Is website ke environment variables ko is password ki zaroorat nahi hai.
3. Project ready hone ke baad SQL Editor open karo.
4. `supabase/01-schema-and-seed.sql` ka **poora content** copy/paste karke Run karo.
5. Success ke baad Table Editor mein public content tables aur Storage mein `portfolio-media` bucket nazar aayegi.

Yeh file ek saath sari required table queries, permissions aur tumhari initial information create karti hai. Har table ko alag se manually banana zaroori nahi.

| Table | Is mein kya hai? |
| --- | --- |
| `auth.users` | Supabase ka managed email/password account system |
| `portfolio_private.admin_users` | Kis Auth user ko admin access hai; SQL Editor se manage hota hai |
| `public.site_settings` | Name, About, portrait, email, phone aur location |
| `public.services` | Professional role titles, descriptions, icons aur related tags |
| `public.skills` | CV ki 12 individually editable skills, group, order aur visibility |
| `public.experience` | Companies, roles, durations aur descriptions |
| `public.education` | Qualifications aur status |
| `public.social_links` | Tumhare approved social profiles |
| `public.projects` | Project detail, category, cover, links, draft/published status |
| `public.project_media` | Har project ki creative images aur videos/posters |
| `storage.buckets` / `storage.objects` | Supabase Storage ki managed tables aur upload permissions |

Admin table private schema mein hai, is liye woh normal public Table Editor view mein na bhi dikhe. SQL Editor se query kar sakte ho.

## 3. Apna admin account banao

1. Supabase → Authentication → Users mein **Add user / Create new user** open karo.
2. Email `muhiudinali215@gmail.com` aur apna strong password set karo.
3. Email ko auto-confirm / confirmed rakho, taake initial login ke liye confirmation email par depend na ho.
4. Ab `supabase/02-create-admin.sql` ka poora content SQL Editor mein run karo.

Agar admin account ke liye doosri email use ki hai, `02-create-admin.sql` mein `admin_email` ki value pehle replace karo. Public contact email aur admin login email alag ho sakti hain.

Ab requested dummy projects ke liye `supabase/04-demo-projects.sql` ka poora content SQL Editor mein run karo. Is se admin ke liye 6 editable sample projects aur 24 image/video gallery records add honge. Database ke sample rows private rehte hain. Is edition mein separate labelled local examples empty public collections mein dikhte hain; real work publish karne par us collection ke examples replace ho jaate hain. Apna work replace karke Sample project untick aur Publish tick karne par project public hoga. Samples ke assets source ke `public/assets` folder mein hain.

Sirf Auth user create karna admin access nahi deta. Doosri SQL file us user ko allowlist mein add karti hai. Password Supabase Auth manage karta hai; SQL mein password nahi likhna.

Authentication settings mein public user sign-ups disable rakho. Is app mein public registration ka form nahi hai.

## 4. Supabase keys copy karo

Project ke **Connect** dialog ya **Settings → API Keys** se Project URL aur Publishable Key copy karo.

Local testing ke liye `.env.example` ki copy `.env.local` bana kar values fill karo:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_VALUE
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Windows par manually file ki copy bana sakte ho. macOS/Linux command:

```bash
cp .env.example .env.local
```

**Legacy anon key use kar rahe ho?** Publishable variable ko remove/blank karo aur yeh variable use karo:

```dotenv
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_LEGACY_ANON_KEY
```

URL aur site URL phir bhi required hain. Dono key variables mein alag values mat rakho; publishable variable ko priority milti hai.

`sb_secret_...` ya `service_role` key ki is app ko zaroorat nahi. Unhein `NEXT_PUBLIC_*` variables mein mat daalo. Browser access ko user login aur SQL RLS policies control karti hain.

## 5. Local check karo

```bash
npm run dev
```

**Pehle design review:** `http://localhost:3000/preview` open karo. Is page par tumhari references ke mutabiq revised design aur saari 6 animations generated realistic sample photos ke saath dekh sakte ho. Supabase configure kiye baghair bhi yeh preview chalega. Samples generated examples ke label ke saath hain; admin se inhein apne work se replace karo.

Browser mein `http://localhost:3000` open karo. Phir `http://localhost:3000/admin` par apni admin email/password se login karo.

Profile, skills, experience aur socials tumhari initial information ke saath honge. 04 run karne par Projects tab mein 6 samples honge. Unhein edit/delete karke apna actual work add karo. Supabase configure nahi hai to public site local sample data dikhati hai; real saving ke liye setup required hai. Real editor `/admin` par hai; `/admin/preview` ab isi route par redirect hota hai.

Optional checks:

```bash
npm run typecheck
npm test
npm run test:database
npm run build
```

Database test local PostgreSQL/WASM par real migration aur RLS permissions check karta hai. Woh tumhare live Supabase project ko modify nahi karta.

## 6. Source GitHub par upload karo

1. GitHub par apne account mein naya repository banao, example `muhiudin-portfolio`.
2. Extracted project folder ke **andar ki files** repository root mein upload karo, taake `package.json` root mein ho.
3. `src`, `public`, `supabase`, `scripts`, `tests`, `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `.gitignore`, `.env.example` aur documentation sab include karo.
4. `.env.local`, `node_modules` aur `.next` upload nahi karne. `.gitignore` inhein exclude karta hai.

Git use karna chahte ho to naya repository banane ke baad terminal mein:

```bash
git init
git add .
git commit -m "Create portfolio and admin panel"
git branch -M main
git remote add origin https://github.com/muhiudinali/muhiudin-portfolio.git
git push -u origin main
```

Repository ka naam different hai to remote URL bhi wahi rakho. Yeh commands apne project folder mein run karo.

## 7. Vercel par deploy karo

1. [Vercel Dashboard](https://vercel.com/dashboard) → Add New → Project.
2. GitHub repository import karo.
3. Framework Preset: **Next.js**.
4. Root Directory: jis folder mein `package.json` hai. Agar poora outer folder repository mein upload kiya tha, Root Directory `muhiudin-portfolio-nextjs` choose karo.
5. Node.js version 22.x ya 24.x rakho. Build Command `npm run build`; Output Directory aur Install Command default rehne do.
6. Environment Variables add karo:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Tumhare Supabase project ka URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Tumhari publishable key; legacy anon alternative upar diya hai |
| `NEXT_PUBLIC_SITE_URL` | Tumhara final portfolio domain, e.g. `https://YOUR_DOMAIN.vercel.app` |

Production aur Preview dono par Supabase variables add kar sakte ho. Preview mein final production site URL rehne par recovery emails production site par khulengi; isolated previews ke liye unka apna site URL aur Auth configuration use karo.

7. Deploy click karo.
8. Agar final domain pehle nahi pata tha, pehle Supabase URL/key se deploy karo. Domain milne par `NEXT_PUBLIC_SITE_URL` update karo aur **Redeploy** karo.

Vercel par environment variables change karne ke baad naya deployment/redeploy zaroori hai. `NEXT_PUBLIC_*` values browser bundle mein build ke waqt set hoti hain.

## 8. Supabase Auth URLs aur recovery email set karo

Deployment ke baad Supabase → Authentication → URL Configuration mein:

```text
Site URL:
https://YOUR_DOMAIN.vercel.app

Redirect URLs:
https://YOUR_DOMAIN.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

Custom domain add karoge to uska actual HTTPS URL yahan aur Vercel ke `NEXT_PUBLIC_SITE_URL` mein update karo, phir redeploy karo.

Password recovery ke liye Authentication → Email Templates → Reset Password mein is link wala template use karo:

```html
<h2>Reset your portfolio admin password</h2>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&amp;type=recovery">Choose a new password</a></p>
```

App mein `/admin/forgot-password` recovery email request karta hai. Link token verify karke `/admin/reset-password` par authorized admin ko new password form dikhata hai. Default confirmation link bhi PKCE callback ke saath supported hai; us case mein request aur email link same browser mein open karo. Token-hash template browser switch ke liye bhi useful hai.

Recovery email bhejne ke liye Supabase email delivery/SMTP configuration kaam karni chahiye. Agar email nahi aati, Authentication email settings aur email logs check karo; apna SMTP provider configure karo. Normal confirmed-user email/password login recovery email delivery par depend nahi karta.

## 9. Projects aur media add karo

1. `https://YOUR_DOMAIN.vercel.app/admin` open karo aur login karo.
2. Projects → Add new.
3. Title, slug, category, summary aur project details add karo. **Collection page** mein Image Ads, Video Ads, Web & App ya Branding choose karo; yeh control karta hai project kis separate page par dikhega.
4. Cover image upload karo. Actual project/GitHub URL ho to add karo; optional fields khaali reh sakti hain.
5. Pehle draft ke taur par save karo.
6. Project Media → Add media → project choose karo.
7. Image upload karo, ya video ke liye MP4/WebM upload / direct HTTPS video file URL do.
8. Video ke saath poster image zaroor do. Accessible description aur caption fill karo.
9. Display order se sequence control karo. Lower number pehle dikhata hai.
10. Projects mein wapas edit karke Publish tick karo aur Save changes karo. Agar sample replace kiya hai to **Sample project** untick karo, taake project aur gallery public portfolio par visible hon. Sirf Publish tick karne se sample visible nahi hota.

Featured projects public list mein pehle aate hain; phir display order apply hota hai. Published project ka shareable URL `/projects/YOUR_SLUG` hai. Draft URL public visitors ke liye 404 rahega.

Creative images ka full viewer original aspect ratio preserve karta hai. Video gallery poster dikhati hai aur Play button par selected video controls ke saath khulta hai. YouTube/TikTok page link ko direct MP4 file URL ki jagah mat use karo; external project link mein de sakte ho.

Uploads ke liye app aur bucket limit **50 MB per file** hai. Images JPEG/PNG/WebP/GIF aur videos MP4/WebM supported hain. Large videos ke liye externally hosted direct video URL use karo. Supabase project ka global upload limit bhi upload size allow karna chahiye.

Storage bucket public hai. **Draft project ke database records hidden hain, lekin uploaded file ka URL public hai.** Sirf woh media upload karo jo public portfolio ke liye intended ho. Entry delete karne par database gallery records cascade ho sakte hain, uploaded files Storage mein rehti hain. Unused files manually delete karo, references check karne ke baad.

## 10. Final review

- Incognito window mein `/admin` login form dikhaye.
- Login ke baad project add/edit, cover upload aur gallery upload check karo.
- Draft project public homepage/direct URL par visible na ho.
- Apna work Publish karo aur Sample project untick karo; homepage refresh par project visible ho. Sample aur draft public/direct URL par hidden rahein.
- Navbar ke saare separate pages, four collection pages, service details aur project detail pages browse karo. Route list PAGES.md mein hai.
- `/preview` mein hover, scroll, project open/back, gallery expand aur cursor trail references ke saath compare karo.
- `/admin` par login karke profile, skills, projects aur media ki actual save/upload check karo.
- Actual project open/back animation, gallery expand, image full view aur video playback check karo.
- Home refresh karke starting stairs check karo; ribbon ko ek complete loop tak dekho.
- Footer ke paas se menu link open karo: naya page top par aaye. Back/Forward aur section anchors bhi check karo.
- Mobile menu, email/phone/social links aur keyboard Tab/Enter/Escape check karo.
- Password recovery email aur new password flow check karo.
- Device ki Reduced Motion preference par decorative motion kam/disabled ho.
- Profile aur contact update karke public page reload karo.

Public content har request par current published data fetch karta hai; admin edits ke liye normally redeploy ki zaroorat nahi. Code, local assets ya environment variables change karne par redeploy karo.

## Common issues

| Problem | Check / solution |
| --- | --- |
| Supabase not configured | Variable names exact rakho, actual URL/public key do aur Vercel redeploy karo |
| Auth login fails | Auth user ka password/email check karo aur initial user confirmed rakho |
| Account has no admin access | Auth user create karke usi email ke saath `02-create-admin.sql` run karo |
| Database setup needed | `01-schema-and-seed.sql` ka poora transaction successfully run hua ho |
| Collection columns missing | Existing setup mein 03-upgrade-project-collections.sql run karo |
| Upload failed | Admin login, storage bucket, four storage policies, allowed file type aur global/bucket size limits check karo |
| Project publish nahi hota | Cover image required hai; slug unique aur lowercase hona chahiye |
| Published work public page par missing hai | Apna work replace karne ke baad Sample project untick karo; visibility ke liye Publish tick aur is_demo false dono required hain |
| Video save nahi hota | Video poster image aur direct supported video file URL required hain |
| Recovery email nahi aati | Supabase email delivery/SMTP, logs, Site URL aur recovery template check karo |
| Project changes public page par nahi | Published checkbox check karo, browser reload karo, aur Supabase project mismatch na ho |
| Vercel ko Next.js nahi milta | Root Directory wahi ho jahan `package.json` hai |

## Official references

- [Supabase cookie-based Next.js Auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase public and secret API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Vercel environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables)

Live credentials, email delivery aur Vercel domain tum apne accounts mein configure karoge. Source code aur SQL ready hain; koi live Supabase/Vercel deployment is archive se pehle connect ya publish nahi ki gayi.

## Is revision ke liye existing website ka update

1. Agar original schema pehle installed hai, Supabase SQL Editor mein `supabase/06-cv-skills-editor.sql` ka poora content run karo. Yeh `public.skills` table, permissions aur CV ke 12 skill records create karti hai.
2. Agar collection upgrade 03 pehle nahi ki, `03-upgrade-project-collections.sql` bhi run karo. Pehle se run hai to dobara zaroori nahi.
3. Optional: `05-update-cv-skills.sql` older service-related tags mein full CV tool names add karti hai. Dedicated 12-entry inventory 06 se aati hai.
4. Revised source Vercel par existing Supabase environment variables ke saath redeploy karo.
5. Apne URL ke baad `/admin` open karo aur allowlisted Supabase user se login karo.

Naya Supabase project updated 01 se skills table aur complete CV inventory seed karta hai, is liye 06 separately required nahi. New setup ka order **01 → Auth user → 02 → optional 04 samples** hai.

Admin ke **Skills** tab mein har CV skill ka naam, group, order aur visibility edit/add/delete ho sakti hai. **Services & Roles** tab mein AI Content Creator, Performance Marketer aur Web & App Developer roles edit hote hain. Profile & Contact, Projects, Project Media, Experience, Education aur Social Links ke tabs bhi actual database-backed editors hain.

Supabase keys ya owner login configure kiye baghair public sample website dikh sakti hai, lekin editor fake saving nahi karta. Login gate setup needed dikhata hai. Koi password SQL table mein nahi rakha gaya; owner Auth user aur SQL allowlist use hoti hai.

Purane local sample-image URLs generated photos par redirect hote hain. Existing sample record ke cover/media paths bhi admin se update kar sakte ho. Generated images aur sample projects ki jagah apna work lagane ke baad Sample project checkbox untick karo.

## 13 October edition — fonts, collection motion aur dummy work

- Headings: Anton. Paragraphs / simple text: DM Sans.
- Video 1 gallery: /skills#video-ads aur collection pages. Video 2 showcase: sirf /projects.
- PORTFOLIO_SHOW_SAMPLES=true default hai. Six labelled local examples empty collections mein visible hain, Supabase connect na ho tab bhi.
- Actual work publish + Sample project untick karne par us collection ke local examples hat jaate hain.
- Local examples src/lib/demo-projects.ts se Antigravity mein edit kar sakte ho; detailed map ANTIGRAVITY-HANDOFF.md mein hai.
- Saare local examples hide karne ke liye PORTFOLIO_SHOW_SAMPLES=false set karo aur restart/redeploy karo. Database drafts/private sample rows ki existing permissions apply rahengi.
- 07-hide-demo-projects.sql database ke sample rows hide karti hai; new labelled local template examples is rule se separate hain.

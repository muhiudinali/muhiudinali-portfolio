# Latest revision — 13 October 2026

- Tall condensed Anton now applies to all website headings; DM Sans remains the clean body/interface font.
- Re-inspected both supplied recordings. Video 1 ExpandOnHover assembles the collection work, including /skills#video-ads. Video 2 Projects Showcase is exclusively /projects.
- Home keeps its previous corner work composition as ordinary detail links. Collection pages use assembled galleries and project permalinks.
- Added a Skills Video Ads work section and direct link from the skill-role area.
- Six labelled local examples fill empty collections; publishing owner work replaces examples by collection. They can be disabled with PORTFOLIO_SHOW_SAMPLES=false.
- Approved layout, colours, portrait, intro/scroll/role/contact animations, all CV skills and actual admin are retained.
- ANTIGRAVITY-HANDOFF.md provides exact source-edit locations and review links.

## Earlier revisions

# Typography, full CV skills and real admin — 12 October 2026

- Reference typography pairing: oversized condensed masthead, elegant serif name/section headings, clean sans body text. Local Anton, Bodoni Moda and DM Sans assets are included.
- All twelve CV skill entries are visible on Home, Skills and Journey. The full inventory is separate from service tags and has its own actual editable database table.
- AI Content Creator, Performance Marketer and Web & App Developer are retained. Their names/descriptions/tags remain editable under Services & Roles.
- Four generated realistic photo assets replace all former cartoon visuals in skills, services, projects, decorative scenes and sample media. Old image URLs redirect to corresponding photos.
- Sample clips are three silent photo-motion studies; all six dummy projects remain editable and labelled examples.
- `/admin` is the real Supabase content editor. The previous read-only admin preview is retired and redirects to `/admin`.
- Skills, profile, services/roles, projects, images/videos, experience, education and social links use validated authenticated database saves. Uploads use owner-authenticated Supabase Storage.
- Fresh installations use updated 01; existing installations add the Skills editor with 06-cv-skills-editor.sql. Service-tag migration 05 stays optional.
- Existing separate public pages, A01–A06 motions, approved portrait/palette, three-line menu and contact logo cursor trail are retained.
- SETUP.md contains the full Supabase/Vercel process, PAGES.md the route map, CV_SKILLS.md the exact inventory and VERIFICATION.md the checks and live-test limits.

## Retained loader, continuous ribbon and navigation cleanup

- A04 plays on every full refresh and stays out of ordinary internal page changes.
- Responsive measured ribbon groups repeat continuously with no trailing blank gap.
- Two independent orbit axes behind the portrait, subtle disc breathing, rotating stars and contact orbit motion; reduced-motion preferences are respected.
- Extra collection grid removed; its categories, counts and links are merged into Projects filters.
- Samples are hidden from public pages and public project/media reads. Real admin keeps the editable sample records. Use 07-hide-demo-projects.sql on an existing Supabase setup.
- New page navigation goes to the top; section anchors and per-entry Back/Forward restoration are handled explicitly. Focus and nested overlay scroll locks no longer force footer jumps.
- Long project lists use natural-height layout. Collection filters reset correctly on collection navigation.
- Profile name in page kickers and browser metadata follows admin edits. The approved photograph and existing CV skills/real admin remain intact.
- Updated setup, page map, animation notes and verification record are included.

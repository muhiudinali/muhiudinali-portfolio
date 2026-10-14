# Full CV skills and real editing

The exact twelve CV skill entries are listed in CV_SKILLS.md and visible on Home, /skills and /journey. They have their own Skills tab and `public.skills` records, separate from the three retained professional roles.

**Existing Supabase:** run `supabase/06-cv-skills-editor.sql`, redeploy the source and open `/admin`. Run 03 only if the earlier collection upgrade is missing. 05 optionally updates the older service tags.

**New Supabase:** updated 01 includes the full table/list. Create your Auth user, run 02 to allowlist the owner and optionally 04 for editable samples. See SETUP.md for keys and deployment.

The Skills editor changes each name, group, display order and visibility, and adds/deletes entries. Services & Roles edits the existing AI, marketing and development roles. Other content tabs use the same real authenticated CRUD endpoints. The previous `/admin/preview` URL now redirects to the real editor.

Typography follows the reference's condensed/serif/sans mix. Generated realistic photos replace cartoon imagery, while contact stamps remain the approved platform marks. The transparent portrait and three-line menu remain.

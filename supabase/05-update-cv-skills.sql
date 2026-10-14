-- Existing portfolio: run once in the Supabase SQL Editor after 01 is installed.
-- Fresh setup already includes these CV skills in 01. Rerunning 05 is safe.
-- Update only the original three role records; keep titles, descriptions,
-- visibility, ordering and owner-added skills. Common old tags are normalized.
begin;

with cv_skills(id, tags) as (values
  ('11111111-1111-4111-8111-111111111111'::uuid, array[
    'AI Content & Creative Ads', 'AI-Powered Ads & Content Creation',
    'AI Image Ads', 'AI Video Ads', 'Logo Design & Brand Identity',
    'Graphic Design & Branding', 'Adobe Photoshop', 'Adobe Illustrator'
  ]),
  ('22222222-2222-4222-8222-222222222222'::uuid, array[
    'Performance Marketing', 'Social Media Management & Marketing', 'SEO & Digital Marketing'
  ]),
  ('33333333-3333-4333-8333-333333333333'::uuid, array[
    'Web & AI Website Development', 'Frontend & Backend Development',
    'Next.js', 'React', 'UI/UX Design', 'Figma Design'
  ])
)
update public.services as service
set tags = (
  select array_agg(tag order by first_position)
  from (
    select tag, min(position) as first_position
    from (
      select case original
        when 'AI images & video' then 'AI-Powered Ads & Content Creation'
        when 'Photoshop' then 'Adobe Photoshop'
        when 'Illustrator' then 'Adobe Illustrator'
        when 'Branding' then 'Graphic Design & Branding'
        when 'SEO' then 'SEO & Digital Marketing'
        when 'Social media' then 'Social Media Management & Marketing'
        when 'UI / UX' then 'UI/UX Design'
        when 'Figma' then 'Figma Design'
        else original
      end as tag, position
      from unnest(service.tags || cv_skills.tags) with ordinality as input(original, position)
    ) as normalized
    group by tag
  ) as unique_tags
)
from cv_skills
where service.id = cv_skills.id;

commit;

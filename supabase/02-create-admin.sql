-- Run SECOND, AFTER creating an email/password user in Supabase Authentication.
-- SQL Editor runs this as the database owner. This is not a browser/API action.
-- Replace the email below if you used a different admin email.
do $$
declare
  admin_email text := 'muhiudinali215@gmail.com';
  admin_id uuid;
begin
  select id into admin_id from auth.users where lower(email) = lower(admin_email);
  if admin_id is null then
    raise exception 'Create the Auth user first: %', admin_email;
  end if;
  insert into portfolio_private.admin_users(user_id) values (admin_id)
  on conflict (user_id) do nothing;
end $$;

-- Check the allowlist (SQL Editor only):
select a.user_id, u.email, a.created_at
from portfolio_private.admin_users a join auth.users u on u.id = a.user_id;

-- To revoke an admin later, use SQL Editor:
-- delete from portfolio_private.admin_users
-- where user_id = (select id from auth.users where email = 'ADMIN_EMAIL_HERE');

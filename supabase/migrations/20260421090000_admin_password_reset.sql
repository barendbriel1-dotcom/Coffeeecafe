-- Reset password and ensure Admin role for barend@encounterchurch.co.za
-- Run this in the Supabase SQL Editor or push via CLI

-- 1. Update the password (using bcrypt)
-- NOTE: Change 'Matrix2026!' to your desired password before running
UPDATE auth.users 
SET encrypted_password = crypt('Matrix2026!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'barend@encounterchurch.co.za';

-- 2. Ensure the user has the 'admin' role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'barend@encounterchurch.co.za'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Optionally remove the default 'volunteer' role if it exists
DELETE FROM public.user_roles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'barend@encounterchurch.co.za')
AND role = 'volunteer';

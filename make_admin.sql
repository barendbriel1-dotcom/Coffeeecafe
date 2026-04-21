-- Instructions to reset your password and make your account an Admin:
-- 1. Copy this entire script.
-- 2. Open your Supabase Dashboard and go to the SQL Editor.
-- 3. Paste and run this script.
-- 4. Log in to your app using barend@encounterchurch.co.za and the password: Matrix2026!

-- 1. Reset the password for barend@encounterchurch.co.za
UPDATE auth.users 
SET encrypted_password = crypt('Matrix2026!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'barend@encounterchurch.co.za';

-- 2. Grant the Admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'barend@encounterchurch.co.za'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Ensure no conflicting roles (like volunteer) exist for you
DELETE FROM public.user_roles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'barend@encounterchurch.co.za')
AND role != 'admin';

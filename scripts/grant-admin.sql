-- Run this script in the Supabase SQL Editor to grant admin access to barend@encounterchurch.co.za
-- Replace 'barend@encounterchurch.co.za' if the email differs.

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find the user ID by email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = 'barend@encounterchurch.co.za';

    IF target_user_id IS NOT NULL THEN
        -- Insert or update the user role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE 
        SET role = 'admin';
        
        RAISE NOTICE 'Admin role granted to user %', target_user_id;
    ELSE
        RAISE EXCEPTION 'User not found. Ensure the user has registered before running this script.';
    END IF;
END $$;

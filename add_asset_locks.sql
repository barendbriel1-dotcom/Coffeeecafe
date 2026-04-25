-- Migration to add asset locking capabilities
-- This allows admins to "reserve" assets during the Group Signout workflow
-- so that other users cannot sign them out at the same time.

ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS locked_by uuid REFERENCES auth.users(id);
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS locked_at timestamp with time zone;

-- Also update the schema cache
NOTIFY pgrst, 'reload schema';

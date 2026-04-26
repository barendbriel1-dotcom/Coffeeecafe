ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'asset_manager';

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS asset_manager_location_id UUID REFERENCES public.locations(id);

CREATE OR REPLACE FUNCTION public.is_staff_or_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    public.has_role(_user_id, 'admin')
    OR public.has_role(_user_id, 'staff')
    OR public.has_role(_user_id, 'asset_manager');
$$;

NOTIFY pgrst, 'reload schema';

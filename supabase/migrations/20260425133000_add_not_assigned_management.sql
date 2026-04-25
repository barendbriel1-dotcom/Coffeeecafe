ALTER TYPE public.asset_status ADD VALUE IF NOT EXISTS 'not_assigned';

INSERT INTO public.locations (name, code, is_storage)
SELECT 'Not Assigned', 'N', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.locations WHERE lower(name) = 'not assigned'
);

INSERT INTO public.divisions (name, code)
SELECT 'Not Assigned', 'NASS'
WHERE NOT EXISTS (
  SELECT 1 FROM public.divisions WHERE lower(name) = 'not assigned'
);

NOTIFY pgrst, 'reload schema';

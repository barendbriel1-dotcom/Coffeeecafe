-- 1. Rename 'departments' table to 'locations' for clarity
ALTER TABLE IF EXISTS public.departments RENAME TO locations;

-- 2. Create the 'divisions' table
CREATE TABLE IF NOT EXISTS public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Add division_id to assets
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS division_id UUID REFERENCES public.divisions(id);

-- 4. Enable RLS on divisions
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "divisions_read" ON public.divisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "divisions_admin" ON public.divisions FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 5. Clear and Seed Locations
DELETE FROM public.locations;
INSERT INTO public.locations (name, code, is_storage) VALUES
  ('Centurion', 'C', true),
  ('Office', 'O', true),
  ('Krugersdorp', 'K', false),
  ('Lanseria', 'L', false),
  ('Traveling', 'T', false);

-- 6. Seed Divisions
INSERT INTO public.divisions (name, code) VALUES
  ('Worship', 'W'),
  ('Videography', 'V'),
  ('Livestream Sound', 'LS'),
  ('FOH Sound', 'FS'),
  ('ProPresenter', 'PP'),
  ('eCafe', 'EC'),
  ('eKids', 'EK'),
  ('Welcoming', 'WC'),
  ('Parking', 'PK'),
  ('Assets', 'AS'),
  ('Lounge', 'LG'),
  ('Cleaning', 'CL'),
  ('Offering', 'OF'),
  ('Oporations', 'OP'),
  ('Schools', 'SC'),
  ('Photography', 'PH'),
  ('Ushers', 'US');

-- 7. Update foreign key names in other tables for consistency (Optional but recommended)
-- Note: We keep the column names as is for now to avoid breaking the app immediately, 
-- but we will update the frontend to treat 'department_id' as 'location_id'.

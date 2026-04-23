-- Align asset lifecycle statuses with the updated frontend flow
ALTER TYPE public.asset_status RENAME VALUE 'maintenance' TO 'out_for_repairs';
ALTER TYPE public.asset_status RENAME VALUE 'retired' TO 'damaged';

-- Normalize any remaining legacy damaged state
UPDATE public.assets
SET status = 'damaged'
WHERE status = 'lost';

-- Keep current location populated for assets that still fall back to their base location
UPDATE public.assets
SET current_location_id = department_id
WHERE current_location_id IS NULL;

-- Rename Lanseria to Prophet while preserving the existing row id when possible
UPDATE public.locations
SET name = 'Prophet', code = 'P'
WHERE name = 'Lanseria' OR code = 'L';

-- Ensure the required locations exist
INSERT INTO public.locations (name, code, is_storage)
VALUES
  ('Centurion', 'C', true),
  ('Krugersdorp', 'K', true),
  ('Office', 'O', true),
  ('Prophet', 'P', false),
  ('Traveling', 'T', false)
ON CONFLICT (name) DO UPDATE
SET code = EXCLUDED.code,
    is_storage = EXCLUDED.is_storage;

-- New asset tag format:
-- Division first character + asset name first character + 3 digit sequence
CREATE OR REPLACE FUNCTION public.generate_asset_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  division_char TEXT;
  asset_char TEXT;
  prefix TEXT;
  next_num INT;
BEGIN
  IF NEW.code IS NOT NULL AND NEW.code <> '' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 1)), ''), 'X')
  INTO division_char
  FROM public.divisions
  WHERE id = NEW.division_id;

  asset_char := COALESCE(NULLIF(UPPER(LEFT(REGEXP_REPLACE(NEW.name, '[^A-Za-z0-9]', '', 'g'), 1)), ''), 'X');
  prefix := COALESCE(division_char, 'X') || asset_char;

  SELECT COALESCE(MAX(RIGHT(code, 3)::INT), 0) + 1
  INTO next_num
  FROM public.assets
  WHERE code ~ ('^' || prefix || '[0-9]{3}$');

  IF next_num > 999 THEN
    RAISE EXCEPTION 'No more tag codes available for prefix %', prefix;
  END IF;

  NEW.code := prefix || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$;

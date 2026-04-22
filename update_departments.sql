-- SQL script to rename specific departments based on user request

BEGIN;

UPDATE public.departments 
SET name = 'Media' 
WHERE name = 'Media / Production';

UPDATE public.departments 
SET name = 'Worship' 
WHERE name = 'Worship / Music';

UPDATE public.departments 
SET name = 'Staff' 
WHERE name = 'Tech / IT';

COMMIT;

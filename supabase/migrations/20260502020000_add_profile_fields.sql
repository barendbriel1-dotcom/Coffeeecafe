alter table public.profiles
add column if not exists phone text,
add column if not exists profile_notes text;

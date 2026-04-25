-- Migration: Add Asset Manager role and location tracking

-- 1. Add 'asset_manager' to the app_role ENUM type.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'asset_manager';

-- 2. Add the column to link an asset manager to a specific location in profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS asset_manager_location_id UUID REFERENCES public.locations(id);

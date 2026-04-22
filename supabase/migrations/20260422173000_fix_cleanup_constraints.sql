-- 1. Add missing DELETE policies for Admins
CREATE POLICY "signout_items_admin_delete" ON public.signout_items FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "handover_items_admin_delete" ON public.handover_items FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "requests_admin_delete" ON public.asset_requests FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- 2. Update Foreign Keys to support CASCADE deletion
-- This makes the "Testing Cleanup" button work instantly by cleaning up child records automatically.

-- Update signout_items
ALTER TABLE public.signout_items DROP CONSTRAINT IF EXISTS signout_items_asset_id_fkey;
ALTER TABLE public.signout_items ADD CONSTRAINT signout_items_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Update handover_items
ALTER TABLE public.handover_items DROP CONSTRAINT IF EXISTS handover_items_asset_id_fkey;
ALTER TABLE public.handover_items ADD CONSTRAINT handover_items_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Update asset_requests
ALTER TABLE public.asset_requests DROP CONSTRAINT IF EXISTS asset_requests_asset_id_fkey;
ALTER TABLE public.asset_requests ADD CONSTRAINT asset_requests_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

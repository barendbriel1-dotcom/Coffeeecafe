CREATE TABLE IF NOT EXISTS public.asset_delete_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL UNIQUE REFERENCES public.assets(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.asset_delete_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_asset_delete_requests_created_at
  ON public.asset_delete_requests(created_at DESC);

DROP POLICY IF EXISTS "asset_delete_requests_admin_select" ON public.asset_delete_requests;
CREATE POLICY "asset_delete_requests_admin_select"
  ON public.asset_delete_requests
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "asset_delete_requests_admin_insert" ON public.asset_delete_requests;
CREATE POLICY "asset_delete_requests_admin_insert"
  ON public.asset_delete_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) AND requested_by = auth.uid());

DROP POLICY IF EXISTS "asset_delete_requests_admin_delete" ON public.asset_delete_requests;
CREATE POLICY "asset_delete_requests_admin_delete"
  ON public.asset_delete_requests
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

NOTIFY pgrst, 'reload schema';

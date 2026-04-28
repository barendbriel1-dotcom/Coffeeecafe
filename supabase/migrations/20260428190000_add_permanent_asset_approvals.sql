-- Permanent asset assignments require approval by the main admin account.

ALTER TYPE public.asset_status ADD VALUE IF NOT EXISTS 'permanent';

CREATE TABLE IF NOT EXISTS public.permanent_asset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  target_user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_permanent_asset_requests_one_pending
  ON public.permanent_asset_requests(asset_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_permanent_asset_requests_status_created
  ON public.permanent_asset_requests(status, created_at DESC);

ALTER TABLE public.permanent_asset_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "permanent_asset_requests_admin_select" ON public.permanent_asset_requests;
CREATE POLICY "permanent_asset_requests_admin_select"
  ON public.permanent_asset_requests
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "permanent_asset_requests_admin_insert" ON public.permanent_asset_requests;
CREATE POLICY "permanent_asset_requests_admin_insert"
  ON public.permanent_asset_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) AND requested_by = auth.uid());

DROP POLICY IF EXISTS "permanent_asset_requests_admin_update" ON public.permanent_asset_requests;
CREATE POLICY "permanent_asset_requests_admin_update"
  ON public.permanent_asset_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS permanent_asset_requests_updated ON public.permanent_asset_requests;

CREATE TRIGGER permanent_asset_requests_updated
  BEFORE UPDATE ON public.permanent_asset_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_main_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = target_user_id
      AND lower(p.email) = 'barend@encounterchurch.co.za'
  );
$$;

CREATE OR REPLACE FUNCTION public.request_permanent_asset_assignment(
  target_asset_ids uuid[],
  target_user_id uuid,
  request_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_asset_id uuid;
  v_asset record;
  v_count integer := 0;
BEGIN
  IF v_actor IS NULL OR NOT public.is_staff_or_admin(v_actor) THEN
    RAISE EXCEPTION 'Only staff, admins, or Assets Managers can request permanent assignments';
  END IF;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Choose the user who will permanently hold the item';
  END IF;

  IF COALESCE(array_length(target_asset_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Select at least one asset';
  END IF;

  FOREACH v_asset_id IN ARRAY target_asset_ids LOOP
    SELECT id, code, status
    INTO v_asset
    FROM public.assets
    WHERE id = v_asset_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Asset % could not be found', v_asset_id;
    END IF;

    IF v_asset.status NOT IN ('available', 'permanent') THEN
      RAISE EXCEPTION 'Asset % must be available or already permanent before it can be requested as permanent', v_asset.code;
    END IF;

    INSERT INTO public.permanent_asset_requests (asset_id, requested_by, target_user_id, notes)
    VALUES (v_asset_id, v_actor, target_user_id, NULLIF(TRIM(request_notes), ''));

    INSERT INTO public.asset_history (asset_id, action, performed_by, to_user, notes)
    VALUES (
      v_asset_id,
      'permanent_requested',
      v_actor,
      target_user_id,
      COALESCE(NULLIF(TRIM(request_notes), ''), 'Permanent assignment or transfer requested for approval.')
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'requested_count', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_permanent_asset_assignment(uuid[], uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_permanent_asset_request(
  target_request_id uuid,
  approve_request boolean,
  review_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_request record;
  v_asset record;
  v_traveling_location_id uuid;
BEGIN
  IF v_actor IS NULL OR NOT public.is_main_admin(v_actor) THEN
    RAISE EXCEPTION 'Only barend@encounterchurch.co.za can approve permanent assignments';
  END IF;

  SELECT *
  INTO v_request
  FROM public.permanent_asset_requests
  WHERE id = target_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Permanent assignment request could not be found';
  END IF;

  IF v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'This permanent assignment request has already been reviewed';
  END IF;

  IF NOT approve_request THEN
    UPDATE public.permanent_asset_requests
    SET status = 'rejected',
        reviewed_by = v_actor,
        reviewed_at = now(),
        admin_notes = NULLIF(TRIM(review_notes), '')
    WHERE id = target_request_id;

    INSERT INTO public.asset_history (asset_id, action, performed_by, to_user, notes)
    VALUES (
      v_request.asset_id,
      'permanent_rejected',
      v_actor,
      v_request.target_user_id,
      COALESCE(NULLIF(TRIM(review_notes), ''), 'Permanent assignment rejected.')
    );

    RETURN jsonb_build_object('success', true, 'status', 'rejected');
  END IF;

  SELECT id, code, status, locked_by, locked_at
  INTO v_asset
  FROM public.assets
  WHERE id = v_request.asset_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The asset could not be found anymore';
  END IF;

  IF v_asset.status NOT IN ('available', 'permanent') THEN
    RAISE EXCEPTION 'Asset % is no longer available for permanent assignment or transfer', v_asset.code;
  END IF;

  IF v_asset.locked_by IS NOT NULL
    AND v_asset.locked_at IS NOT NULL
    AND v_asset.locked_by <> v_actor
    AND v_asset.locked_at > now() - interval '15 minutes'
  THEN
    RAISE EXCEPTION 'Asset % is locked by another workflow', v_asset.code;
  END IF;

  SELECT id
  INTO v_traveling_location_id
  FROM public.locations
  WHERE name = 'Traveling'
  LIMIT 1;

  IF v_traveling_location_id IS NULL THEN
    RAISE EXCEPTION 'Traveling location was not found';
  END IF;

  UPDATE public.assets
  SET status = 'permanent',
      current_holder = v_request.target_user_id,
      current_location_id = v_traveling_location_id,
      locked_by = NULL,
      locked_at = NULL,
      updated_at = now()
  WHERE id = v_request.asset_id;

  UPDATE public.permanent_asset_requests
  SET status = 'approved',
      reviewed_by = v_actor,
      reviewed_at = now(),
      admin_notes = NULLIF(TRIM(review_notes), '')
  WHERE id = target_request_id;

  INSERT INTO public.asset_history (asset_id, action, performed_by, to_user, notes)
  VALUES (
    v_request.asset_id,
    'permanent_assigned',
    v_actor,
    v_request.target_user_id,
    COALESCE(NULLIF(TRIM(review_notes), ''), 'Permanent assignment approved.')
  );

  RETURN jsonb_build_object('success', true, 'status', 'approved');
END;
$$;

GRANT EXECUTE ON FUNCTION public.review_permanent_asset_request(uuid, boolean, text) TO authenticated;

NOTIFY pgrst, 'reload schema';

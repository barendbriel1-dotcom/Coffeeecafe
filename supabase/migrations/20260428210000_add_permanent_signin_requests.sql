ALTER TABLE public.permanent_asset_requests
  ADD COLUMN IF NOT EXISTS request_type TEXT NOT NULL DEFAULT 'assignment'
  CHECK (request_type IN ('assignment', 'sign_in'));

ALTER TABLE public.permanent_asset_requests
  ADD COLUMN IF NOT EXISTS return_location_id UUID REFERENCES public.locations(id);

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

    INSERT INTO public.permanent_asset_requests (asset_id, requested_by, target_user_id, request_type, notes)
    VALUES (v_asset_id, v_actor, target_user_id, 'assignment', NULLIF(TRIM(request_notes), ''));

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

CREATE OR REPLACE FUNCTION public.request_permanent_asset_signin(
  target_asset_ids uuid[],
  target_location_id uuid,
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
  IF v_actor IS NULL OR NOT public.is_admin(v_actor) THEN
    RAISE EXCEPTION 'Only admins can request permanent sign-ins';
  END IF;

  IF target_location_id IS NULL THEN
    RAISE EXCEPTION 'Choose the location where the permanent item will be signed in';
  END IF;

  IF COALESCE(array_length(target_asset_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Select at least one permanent asset';
  END IF;

  FOREACH v_asset_id IN ARRAY target_asset_ids LOOP
    SELECT id, code, status, current_holder
    INTO v_asset
    FROM public.assets
    WHERE id = v_asset_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Asset % could not be found', v_asset_id;
    END IF;

    IF v_asset.status <> 'permanent' THEN
      RAISE EXCEPTION 'Asset % must currently be permanent before it can be requested for permanent sign-in', v_asset.code;
    END IF;

    IF v_asset.current_holder IS NULL THEN
      RAISE EXCEPTION 'Asset % does not currently have a permanent holder', v_asset.code;
    END IF;

    INSERT INTO public.permanent_asset_requests (
      asset_id,
      requested_by,
      target_user_id,
      request_type,
      return_location_id,
      notes
    )
    VALUES (
      v_asset_id,
      v_actor,
      v_asset.current_holder,
      'sign_in',
      target_location_id,
      NULLIF(TRIM(request_notes), '')
    );

    INSERT INTO public.asset_history (asset_id, action, performed_by, from_user, notes)
    VALUES (
      v_asset_id,
      'permanent_signin_requested',
      v_actor,
      v_asset.current_holder,
      COALESCE(NULLIF(TRIM(request_notes), ''), 'Permanent sign-in requested for approval.')
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'requested_count', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_permanent_asset_signin(uuid[], uuid, text) TO authenticated;

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

    INSERT INTO public.asset_history (asset_id, action, performed_by, to_user, from_user, notes)
    VALUES (
      v_request.asset_id,
      CASE WHEN v_request.request_type = 'sign_in' THEN 'permanent_signin_rejected' ELSE 'permanent_rejected' END,
      v_actor,
      CASE WHEN v_request.request_type = 'assignment' THEN v_request.target_user_id ELSE NULL END,
      CASE WHEN v_request.request_type = 'sign_in' THEN v_request.target_user_id ELSE NULL END,
      COALESCE(
        NULLIF(TRIM(review_notes), ''),
        CASE
          WHEN v_request.request_type = 'sign_in' THEN 'Permanent sign-in rejected.'
          ELSE 'Permanent assignment rejected.'
        END
      )
    );

    RETURN jsonb_build_object('success', true, 'status', 'rejected');
  END IF;

  SELECT id, code, status, locked_by, locked_at, current_holder
  INTO v_asset
  FROM public.assets
  WHERE id = v_request.asset_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The asset could not be found anymore';
  END IF;

  IF v_request.request_type = 'sign_in' THEN
    IF v_asset.status <> 'permanent' THEN
      RAISE EXCEPTION 'Asset % is no longer permanent and cannot be signed in through this approval', v_asset.code;
    END IF;

    IF v_request.return_location_id IS NULL THEN
      RAISE EXCEPTION 'A return location is required for permanent sign-in approval';
    END IF;

    UPDATE public.assets
    SET status = 'available',
        current_holder = NULL,
        current_location_id = v_request.return_location_id,
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

    INSERT INTO public.asset_history (asset_id, action, performed_by, from_user, notes)
    VALUES (
      v_request.asset_id,
      'permanent_signed_in',
      v_actor,
      v_request.target_user_id,
      COALESCE(NULLIF(TRIM(review_notes), ''), 'Permanent sign-in approved.')
    );

    RETURN jsonb_build_object('success', true, 'status', 'approved');
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

NOTIFY pgrst, 'reload schema';

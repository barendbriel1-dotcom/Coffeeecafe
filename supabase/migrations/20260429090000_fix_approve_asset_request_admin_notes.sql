CREATE OR REPLACE FUNCTION public.approve_asset_request(
  target_request_id uuid,
  admin_notes text DEFAULT NULL
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
  v_signout_id uuid;
  v_admin_notes text := NULLIF(TRIM(admin_notes), '');
BEGIN
  IF v_actor IS NULL OR NOT public.is_admin(v_actor) THEN
    RAISE EXCEPTION 'Only admins can approve requests';
  END IF;

  SELECT *
  INTO v_request
  FROM public.asset_requests
  WHERE id = target_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request could not be found';
  END IF;

  IF v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending requests can be approved';
  END IF;

  IF v_request.asset_id IS NULL THEN
    UPDATE public.asset_requests
    SET
      status = 'approved',
      reviewed_by = v_actor,
      reviewed_at = now(),
      admin_notes = v_admin_notes,
      updated_at = now()
    WHERE id = target_request_id;

    RETURN jsonb_build_object(
      'success', true,
      'request_id', target_request_id,
      'signout_id', null
    );
  END IF;

  SELECT
    id,
    code,
    status,
    locked_by,
    locked_at
  INTO v_asset
  FROM public.assets
  WHERE id = v_request.asset_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The requested asset could not be found anymore';
  END IF;

  IF v_asset.status <> 'available' THEN
    RAISE EXCEPTION '% is no longer available, so this request cannot be auto-approved', v_asset.code;
  END IF;

  IF v_asset.locked_by IS NOT NULL
    AND v_asset.locked_at IS NOT NULL
    AND v_asset.locked_by <> v_actor
    AND v_asset.locked_at > now() - interval '15 minutes'
  THEN
    RAISE EXCEPTION '% is currently locked by another workflow. Try again after the lock is cleared', v_asset.code;
  END IF;

  SELECT id
  INTO v_traveling_location_id
  FROM public.locations
  WHERE name = 'Traveling'
  LIMIT 1;

  IF v_traveling_location_id IS NULL THEN
    RAISE EXCEPTION 'Traveling location was not found';
  END IF;

  INSERT INTO public.signouts (
    signed_out_by,
    signed_out_to,
    to_department_id,
    notes,
    status
  )
  VALUES (
    v_actor,
    v_request.requested_by,
    v_traveling_location_id,
    format(
      'Auto-approved request: %s%s',
      COALESCE(NULLIF(v_request.needed_for, ''), 'No details'),
      CASE WHEN v_admin_notes IS NOT NULL THEN format(' | %s', v_admin_notes) ELSE '' END
    ),
    'active'
  )
  RETURNING id INTO v_signout_id;

  INSERT INTO public.signout_items (signout_id, asset_id)
  VALUES (v_signout_id, v_request.asset_id);

  UPDATE public.assets
  SET
    status = 'signed_out',
    current_holder = v_request.requested_by,
    current_location_id = v_traveling_location_id,
    locked_by = NULL,
    locked_at = NULL,
    updated_at = now()
  WHERE id = v_request.asset_id;

  INSERT INTO public.asset_history (
    asset_id,
    action,
    performed_by,
    to_user,
    notes
  )
  VALUES (
    v_request.asset_id,
    'signed_out',
    v_actor,
    v_request.requested_by,
    format('Auto-approved request ID: %s', v_request.id)
  );

  UPDATE public.asset_requests
  SET
    status = 'approved',
    reviewed_by = v_actor,
    reviewed_at = now(),
    admin_notes = v_admin_notes,
    updated_at = now()
  WHERE id = target_request_id;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', target_request_id,
    'signout_id', v_signout_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_asset_request(uuid, text) TO authenticated;

NOTIFY pgrst, 'reload schema';

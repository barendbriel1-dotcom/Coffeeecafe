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

NOTIFY pgrst, 'reload schema';

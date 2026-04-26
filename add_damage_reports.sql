-- ============================================================
-- Damage Reports: lock the holder until they explain the damage
-- ============================================================

-- 1. Table
CREATE TABLE IF NOT EXISTS public.damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  asset_code TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  assigned_to UUID NOT NULL REFERENCES auth.users(id),
  reported_by UUID NOT NULL REFERENCES auth.users(id),
  description TEXT,          -- filled by the assigned user
  damaged_date DATE,         -- filled by the assigned user
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;

-- Everyone can read their own; admins read all
CREATE POLICY "damage_reports_read" ON public.damage_reports
  FOR SELECT TO authenticated
  USING (auth.uid() = assigned_to OR public.is_admin(auth.uid()));

-- Assigned user can update their own pending report (to complete it)
CREATE POLICY "damage_reports_update_own" ON public.damage_reports
  FOR UPDATE TO authenticated
  USING (auth.uid() = assigned_to AND status = 'pending');

-- Only security-definer RPCs insert (via sign_in_assets_safe)
CREATE POLICY "damage_reports_admin_insert" ON public.damage_reports
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'asset_manager'));

-- 2. Update sign_in_assets_safe to auto-create a damage report
DROP FUNCTION IF EXISTS public.sign_in_assets_safe(jsonb, uuid, text, text);

CREATE OR REPLACE FUNCTION public.sign_in_assets_safe(
  signin_payload jsonb,
  target_location_id uuid,
  notes text DEFAULT NULL,
  note_prefix text DEFAULT 'Manual sign-in completed.'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_entry jsonb;
  v_asset_id uuid;
  v_next_status_text text;
  v_next_status public.asset_status;
  v_asset record;
  v_active_signout record;
  v_signout_id uuid;
  v_location_name text;
  v_note_text text;
  v_locked_location_id uuid;
  v_processed_count integer := 0;
  v_available_count integer := 0;
  v_repairs_count integer := 0;
  v_damaged_count integer := 0;
  v_signout_ids uuid[] := '{}';
BEGIN
  IF v_actor IS NULL OR NOT (public.is_admin(v_actor) OR public.has_role(v_actor, 'asset_manager')) THEN
    RAISE EXCEPTION 'Only admins or Assets Managers can sign items in';
  END IF;

  IF target_location_id IS NULL THEN
    RAISE EXCEPTION 'Select a return location before confirming';
  END IF;

  IF jsonb_typeof(signin_payload) <> 'array' OR jsonb_array_length(signin_payload) = 0 THEN
    RAISE EXCEPTION 'No sign-in items were provided';
  END IF;

  IF public.has_role(v_actor, 'asset_manager') THEN
    SELECT asset_manager_location_id INTO v_locked_location_id
    FROM public.profiles
    WHERE id = v_actor;

    IF v_locked_location_id IS NULL THEN
      RAISE EXCEPTION 'Assets Manager is missing a locked location';
    END IF;

    IF target_location_id <> v_locked_location_id THEN
      RAISE EXCEPTION 'Assets Managers can only sign items into their locked location';
    END IF;
  END IF;

  SELECT name INTO v_location_name
  FROM public.locations
  WHERE id = target_location_id;

  IF v_location_name IS NULL THEN
    RAISE EXCEPTION 'Return location was not found';
  END IF;

  v_note_text := coalesce(nullif(trim(notes), ''), note_prefix);

  FOR v_entry IN SELECT value FROM jsonb_array_elements(signin_payload) LOOP
    v_asset_id := (v_entry ->> 'asset_id')::uuid;
    v_next_status_text := lower(trim(coalesce(v_entry ->> 'next_status', 'available')));
    v_next_status_text := replace(replace(v_next_status_text, '-', '_'), ' ', '_');

    IF v_next_status_text IN ('available', 'returned') THEN
      v_next_status_text := 'available';
    ELSIF v_next_status_text IN ('out_for_repair', 'out_for_repairs', 'out_for__repairs',
      'sign_out_for_repair', 'sign_out_for_repairs', 'signed_out_for_repair',
      'signed_out_for_repairs', 'repair', 'repairs', 'maintenance') THEN
      v_next_status_text := 'out_for_repairs';
    ELSIF v_next_status_text IN ('damaged', 'damage', 'retired') THEN
      v_next_status_text := 'damaged';
    ELSE
      RAISE EXCEPTION 'Invalid next status for scanned or selected item: %', v_entry ->> 'next_status';
    END IF;

    v_next_status := v_next_status_text::public.asset_status;

    SELECT id, code, name, status, department_id, current_holder
    INTO v_asset
    FROM public.assets
    WHERE id = v_asset_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Asset % could not be found', v_asset_id;
    END IF;

    IF v_locked_location_id IS NOT NULL AND v_asset.department_id <> v_locked_location_id THEN
      RAISE EXCEPTION 'Asset % is outside the locked Assets Manager location', v_asset.code;
    END IF;

    IF v_asset.status <> 'signed_out' THEN
      RAISE EXCEPTION 'Asset % is not currently signed out', v_asset.code;
    END IF;

    SELECT si.id, si.signout_id
    INTO v_active_signout
    FROM public.signout_items si
    WHERE si.asset_id = v_asset_id
      AND si.returned = false
    ORDER BY si.created_at DESC
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Asset % is missing an active sign-out record', v_asset.code;
    END IF;

    -- Create a damage report for the holder when status is damaged
    IF v_next_status = 'damaged' AND v_asset.current_holder IS NOT NULL THEN
      INSERT INTO public.damage_reports (asset_id, asset_code, asset_name, assigned_to, reported_by)
      VALUES (v_asset_id, v_asset.code, v_asset.name, v_asset.current_holder, v_actor);
    END IF;

    UPDATE public.assets
    SET
      status = v_next_status,
      current_holder = NULL,
      current_location_id = target_location_id,
      updated_at = now()
    WHERE id = v_asset_id;

    UPDATE public.signout_items
    SET returned = true
    WHERE id = v_active_signout.id;

    INSERT INTO public.asset_history (asset_id, action, performed_by, from_user, notes)
    VALUES (
      v_asset_id,
      CASE
        WHEN v_next_status = 'available' THEN 'signed_in'
        WHEN v_next_status = 'out_for_repairs' THEN 'sent_for_repairs'
        ELSE 'marked_damaged'
      END,
      v_actor,
      v_asset.current_holder,
      format('%s Returned to %s.', v_note_text, v_location_name)
    );

    v_signout_ids := array_append(v_signout_ids, v_active_signout.signout_id);
    v_processed_count := v_processed_count + 1;

    IF v_next_status = 'available' THEN
      v_available_count := v_available_count + 1;
    ELSIF v_next_status = 'out_for_repairs' THEN
      v_repairs_count := v_repairs_count + 1;
    ELSE
      v_damaged_count := v_damaged_count + 1;
    END IF;
  END LOOP;

  FOR v_signout_id IN SELECT DISTINCT signout_id FROM unnest(v_signout_ids) AS signout_id LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM public.signout_items
      WHERE signout_id = v_signout_id
        AND returned = false
    ) THEN
      UPDATE public.signouts
      SET status = 'returned',
          signed_in_at = now(),
          signed_in_by = v_actor,
          updated_at = now()
      WHERE id = v_signout_id;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'processed_count', v_processed_count,
    'available_count', v_available_count,
    'repairs_count', v_repairs_count,
    'damaged_count', v_damaged_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sign_in_assets_safe(jsonb, uuid, text, text) TO authenticated;

NOTIFY pgrst, 'reload schema';

CREATE OR REPLACE FUNCTION public.can_manage_consumables(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT public.is_admin(target_user_id) OR public.has_role(target_user_id, 'asset_manager');
$$;

CREATE TABLE IF NOT EXISTS public.consumable_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL,
  default_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consumable_types ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS consumable_types_updated ON public.consumable_types;
CREATE TRIGGER consumable_types_updated
  BEFORE UPDATE ON public.consumable_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.consumable_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumable_type_id UUID NOT NULL REFERENCES public.consumable_types(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_damaged INTEGER NOT NULL DEFAULT 0 CHECK (quantity_damaged >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (consumable_type_id, location_id)
);

ALTER TABLE public.consumable_stock ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS consumable_stock_updated ON public.consumable_stock;
CREATE TRIGGER consumable_stock_updated
  BEFORE UPDATE ON public.consumable_stock
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.asset_consumables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  consumable_type_id UUID NOT NULL REFERENCES public.consumable_types(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  follows_parent BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  attached_by UUID NOT NULL REFERENCES auth.users(id),
  attached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  detached_by UUID REFERENCES auth.users(id),
  detached_at TIMESTAMPTZ
);

ALTER TABLE public.asset_consumables ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_consumables_active_unique
  ON public.asset_consumables(asset_id, consumable_type_id)
  WHERE detached_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_asset_consumables_asset_active
  ON public.asset_consumables(asset_id)
  WHERE detached_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_asset_consumables_type_active
  ON public.asset_consumables(consumable_type_id)
  WHERE detached_at IS NULL;

CREATE TABLE IF NOT EXISTS public.consumable_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumable_type_id UUID NOT NULL REFERENCES public.consumable_types(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consumable_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consumable_types_read" ON public.consumable_types;
CREATE POLICY "consumable_types_read"
  ON public.consumable_types
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "consumable_stock_read" ON public.consumable_stock;
CREATE POLICY "consumable_stock_read"
  ON public.consumable_stock
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "asset_consumables_read" ON public.asset_consumables;
CREATE POLICY "asset_consumables_read"
  ON public.asset_consumables
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "consumable_history_read" ON public.consumable_history;
CREATE POLICY "consumable_history_read"
  ON public.consumable_history
  FOR SELECT TO authenticated
  USING (true);

CREATE OR REPLACE VIEW public.consumable_type_totals AS
WITH stock_totals AS (
  SELECT
    consumable_type_id,
    SUM(quantity_available) AS in_stock,
    SUM(quantity_damaged) AS damaged
  FROM public.consumable_stock
  GROUP BY consumable_type_id
),
attached_totals AS (
  SELECT
    ac.consumable_type_id,
    SUM(CASE WHEN a.status = 'permanent' THEN ac.quantity ELSE 0 END) AS permanently_checked_out,
    SUM(CASE WHEN a.status <> 'permanent' THEN ac.quantity ELSE 0 END) AS assigned
  FROM public.asset_consumables ac
  JOIN public.assets a ON a.id = ac.asset_id
  WHERE ac.detached_at IS NULL
  GROUP BY ac.consumable_type_id
)
SELECT
  ct.id AS consumable_type_id,
  ct.name,
  ct.description,
  ct.division_id,
  ct.default_location_id,
  COALESCE(st.in_stock, 0) AS in_stock,
  COALESCE(at.assigned, 0) AS assigned,
  COALESCE(at.permanently_checked_out, 0) AS permanently_checked_out,
  COALESCE(st.damaged, 0) AS damaged
FROM public.consumable_types ct
LEFT JOIN stock_totals st ON st.consumable_type_id = ct.id
LEFT JOIN attached_totals at ON at.consumable_type_id = ct.id;

CREATE OR REPLACE VIEW public.asset_consumables_active AS
SELECT
  ac.id,
  ac.asset_id,
  a.code AS asset_code,
  a.name AS asset_name,
  a.status AS asset_status,
  ac.consumable_type_id,
  ct.name AS consumable_name,
  ac.quantity,
  ac.follows_parent,
  ac.notes,
  ac.attached_by,
  ac.attached_at
FROM public.asset_consumables ac
JOIN public.assets a ON a.id = ac.asset_id
JOIN public.consumable_types ct ON ct.id = ac.consumable_type_id
WHERE ac.detached_at IS NULL;

CREATE OR REPLACE FUNCTION public.create_consumable_type(
  target_name text,
  target_description text DEFAULT NULL,
  target_division_id uuid DEFAULT NULL,
  target_default_location_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_row public.consumable_types;
BEGIN
  IF v_actor IS NULL OR NOT public.can_manage_consumables(v_actor) THEN
    RAISE EXCEPTION 'Only admins or Assets Managers can create consumable types';
  END IF;

  IF NULLIF(TRIM(target_name), '') IS NULL THEN
    RAISE EXCEPTION 'Consumable name is required';
  END IF;

  INSERT INTO public.consumable_types (
    name,
    description,
    division_id,
    default_location_id
  )
  VALUES (
    TRIM(target_name),
    NULLIF(TRIM(target_description), ''),
    target_division_id,
    target_default_location_id
  )
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'success', true,
    'consumable_type_id', v_row.id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_consumable_type(text, text, uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.add_consumable_stock(
  target_consumable_type_id uuid,
  target_location_id uuid,
  quantity_to_add integer,
  stock_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor uuid := auth.uid();
BEGIN
  IF v_actor IS NULL OR NOT public.can_manage_consumables(v_actor) THEN
    RAISE EXCEPTION 'Only admins or Assets Managers can add consumable stock';
  END IF;

  IF quantity_to_add IS NULL OR quantity_to_add <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  IF target_consumable_type_id IS NULL OR target_location_id IS NULL THEN
    RAISE EXCEPTION 'Consumable type and location are required';
  END IF;

  INSERT INTO public.consumable_stock (
    consumable_type_id,
    location_id,
    quantity_available,
    quantity_damaged,
    notes
  )
  VALUES (
    target_consumable_type_id,
    target_location_id,
    quantity_to_add,
    0,
    NULLIF(TRIM(stock_notes), '')
  )
  ON CONFLICT (consumable_type_id, location_id)
  DO UPDATE
  SET
    quantity_available = public.consumable_stock.quantity_available + EXCLUDED.quantity_available,
    notes = COALESCE(EXCLUDED.notes, public.consumable_stock.notes),
    updated_at = now();

  INSERT INTO public.consumable_history (
    consumable_type_id,
    location_id,
    quantity,
    action,
    performed_by,
    notes
  )
  VALUES (
    target_consumable_type_id,
    target_location_id,
    quantity_to_add,
    'consumable_stock_added',
    v_actor,
    COALESCE(NULLIF(TRIM(stock_notes), ''), 'Consumable stock added.')
  );

  RETURN jsonb_build_object('success', true, 'quantity_added', quantity_to_add);
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_consumable_stock(uuid, uuid, integer, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.adjust_consumable_stock_damage(
  target_consumable_type_id uuid,
  target_location_id uuid,
  quantity_to_move integer,
  move_to_damaged boolean DEFAULT true,
  adjustment_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_stock public.consumable_stock;
BEGIN
  IF v_actor IS NULL OR NOT public.can_manage_consumables(v_actor) THEN
    RAISE EXCEPTION 'Only admins or Assets Managers can adjust consumable damage stock';
  END IF;

  IF quantity_to_move IS NULL OR quantity_to_move <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  SELECT *
  INTO v_stock
  FROM public.consumable_stock
  WHERE consumable_type_id = target_consumable_type_id
    AND location_id = target_location_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Consumable stock record could not be found for that location';
  END IF;

  IF move_to_damaged THEN
    IF v_stock.quantity_available < quantity_to_move THEN
      RAISE EXCEPTION 'Not enough available stock to mark damaged';
    END IF;

    UPDATE public.consumable_stock
    SET
      quantity_available = quantity_available - quantity_to_move,
      quantity_damaged = quantity_damaged + quantity_to_move,
      updated_at = now()
    WHERE id = v_stock.id;
  ELSE
    IF v_stock.quantity_damaged < quantity_to_move THEN
      RAISE EXCEPTION 'Not enough damaged stock to restore';
    END IF;

    UPDATE public.consumable_stock
    SET
      quantity_available = quantity_available + quantity_to_move,
      quantity_damaged = quantity_damaged - quantity_to_move,
      updated_at = now()
    WHERE id = v_stock.id;
  END IF;

  INSERT INTO public.consumable_history (
    consumable_type_id,
    location_id,
    quantity,
    action,
    performed_by,
    notes
  )
  VALUES (
    target_consumable_type_id,
    target_location_id,
    quantity_to_move,
    CASE WHEN move_to_damaged THEN 'consumable_marked_damaged' ELSE 'consumable_restored_from_damaged' END,
    v_actor,
    COALESCE(
      NULLIF(TRIM(adjustment_notes), ''),
      CASE WHEN move_to_damaged THEN 'Consumable quantity moved to damaged stock.' ELSE 'Consumable quantity restored to available stock.' END
    )
  );

  RETURN jsonb_build_object('success', true, 'moved_quantity', quantity_to_move);
END;
$$;

GRANT EXECUTE ON FUNCTION public.adjust_consumable_stock_damage(uuid, uuid, integer, boolean, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.attach_consumable_to_asset(
  target_asset_id uuid,
  target_consumable_type_id uuid,
  source_location_id uuid,
  quantity_to_attach integer,
  follows_parent_by_default boolean DEFAULT true,
  attach_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_locked_location_id uuid;
  v_asset public.assets;
  v_stock public.consumable_stock;
  v_link public.asset_consumables;
BEGIN
  IF v_actor IS NULL OR NOT public.can_manage_consumables(v_actor) THEN
    RAISE EXCEPTION 'Only admins or Assets Managers can attach consumables';
  END IF;

  IF quantity_to_attach IS NULL OR quantity_to_attach <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  SELECT *
  INTO v_asset
  FROM public.assets
  WHERE id = target_asset_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Parent asset could not be found';
  END IF;

  IF public.has_role(v_actor, 'asset_manager') THEN
    SELECT asset_manager_location_id
    INTO v_locked_location_id
    FROM public.profiles
    WHERE id = v_actor;

    IF v_locked_location_id IS NULL THEN
      RAISE EXCEPTION 'Assets Manager is missing a locked location';
    END IF;

    IF v_asset.department_id <> v_locked_location_id OR source_location_id <> v_locked_location_id THEN
      RAISE EXCEPTION 'This consumable operation is outside the locked Assets Manager location';
    END IF;
  END IF;

  SELECT *
  INTO v_stock
  FROM public.consumable_stock
  WHERE consumable_type_id = target_consumable_type_id
    AND location_id = source_location_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Consumable stock could not be found for that location';
  END IF;

  IF v_stock.quantity_available < quantity_to_attach THEN
    RAISE EXCEPTION 'Not enough spare consumable stock available';
  END IF;

  UPDATE public.consumable_stock
  SET
    quantity_available = quantity_available - quantity_to_attach,
    updated_at = now()
  WHERE id = v_stock.id;

  SELECT *
  INTO v_link
  FROM public.asset_consumables
  WHERE asset_id = target_asset_id
    AND consumable_type_id = target_consumable_type_id
    AND detached_at IS NULL
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.asset_consumables
    SET
      quantity = quantity + quantity_to_attach,
      follows_parent = follows_parent_by_default,
      notes = COALESCE(NULLIF(TRIM(attach_notes), ''), notes)
    WHERE id = v_link.id;
  ELSE
    INSERT INTO public.asset_consumables (
      asset_id,
      consumable_type_id,
      quantity,
      follows_parent,
      notes,
      attached_by
    )
    VALUES (
      target_asset_id,
      target_consumable_type_id,
      quantity_to_attach,
      follows_parent_by_default,
      NULLIF(TRIM(attach_notes), ''),
      v_actor
    );
  END IF;

  INSERT INTO public.consumable_history (
    consumable_type_id,
    asset_id,
    location_id,
    quantity,
    action,
    performed_by,
    notes
  )
  VALUES (
    target_consumable_type_id,
    target_asset_id,
    source_location_id,
    quantity_to_attach,
    'consumable_attached',
    v_actor,
    COALESCE(NULLIF(TRIM(attach_notes), ''), 'Consumable attached to parent asset.')
  );

  INSERT INTO public.asset_history (
    asset_id,
    action,
    performed_by,
    notes
  )
  VALUES (
    target_asset_id,
    'consumable_attached',
    v_actor,
    COALESCE(NULLIF(TRIM(attach_notes), ''), format('Consumable attached. Quantity: %s', quantity_to_attach))
  );

  RETURN jsonb_build_object('success', true, 'attached_quantity', quantity_to_attach);
END;
$$;

GRANT EXECUTE ON FUNCTION public.attach_consumable_to_asset(uuid, uuid, uuid, integer, boolean, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.detach_consumable_from_asset(
  target_asset_id uuid,
  target_consumable_type_id uuid,
  quantity_to_detach integer,
  destination_location_id uuid,
  move_to_damaged boolean DEFAULT false,
  detach_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_link public.asset_consumables;
BEGIN
  IF v_actor IS NULL OR NOT public.is_admin(v_actor) THEN
    RAISE EXCEPTION 'Only admins can detach consumables from parent assets';
  END IF;

  IF quantity_to_detach IS NULL OR quantity_to_detach <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  SELECT *
  INTO v_link
  FROM public.asset_consumables
  WHERE asset_id = target_asset_id
    AND consumable_type_id = target_consumable_type_id
    AND detached_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active consumable link could not be found for that parent asset';
  END IF;

  IF v_link.quantity < quantity_to_detach THEN
    RAISE EXCEPTION 'Cannot detach more consumables than are attached';
  END IF;

  INSERT INTO public.consumable_stock (
    consumable_type_id,
    location_id,
    quantity_available,
    quantity_damaged
  )
  VALUES (
    target_consumable_type_id,
    destination_location_id,
    CASE WHEN move_to_damaged THEN 0 ELSE quantity_to_detach END,
    CASE WHEN move_to_damaged THEN quantity_to_detach ELSE 0 END
  )
  ON CONFLICT (consumable_type_id, location_id)
  DO UPDATE
  SET
    quantity_available = public.consumable_stock.quantity_available + EXCLUDED.quantity_available,
    quantity_damaged = public.consumable_stock.quantity_damaged + EXCLUDED.quantity_damaged,
    updated_at = now();

  IF v_link.quantity = quantity_to_detach THEN
    UPDATE public.asset_consumables
    SET
      detached_by = v_actor,
      detached_at = now(),
      notes = COALESCE(NULLIF(TRIM(detach_notes), ''), notes)
    WHERE id = v_link.id;
  ELSE
    UPDATE public.asset_consumables
    SET quantity = quantity - quantity_to_detach
    WHERE id = v_link.id;
  END IF;

  INSERT INTO public.consumable_history (
    consumable_type_id,
    asset_id,
    location_id,
    quantity,
    action,
    performed_by,
    notes
  )
  VALUES (
    target_consumable_type_id,
    target_asset_id,
    destination_location_id,
    quantity_to_detach,
    CASE WHEN move_to_damaged THEN 'consumable_detached_to_damaged' ELSE 'consumable_detached_to_stock' END,
    v_actor,
    COALESCE(NULLIF(TRIM(detach_notes), ''), 'Consumable detached from parent asset.')
  );

  INSERT INTO public.asset_history (
    asset_id,
    action,
    performed_by,
    notes
  )
  VALUES (
    target_asset_id,
    'consumable_detached',
    v_actor,
    COALESCE(NULLIF(TRIM(detach_notes), ''), format('Consumable detached. Quantity: %s', quantity_to_detach))
  );

  RETURN jsonb_build_object('success', true, 'detached_quantity', quantity_to_detach);
END;
$$;

GRANT EXECUTE ON FUNCTION public.detach_consumable_from_asset(uuid, uuid, integer, uuid, boolean, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.reassign_consumable_to_asset(
  from_asset_id uuid,
  to_asset_id uuid,
  target_consumable_type_id uuid,
  quantity_to_move integer,
  target_follows_parent boolean DEFAULT true,
  reassign_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_source_link public.asset_consumables;
  v_target_link public.asset_consumables;
BEGIN
  IF v_actor IS NULL OR NOT public.is_admin(v_actor) THEN
    RAISE EXCEPTION 'Only admins can reassign consumables between parent assets';
  END IF;

  IF quantity_to_move IS NULL OR quantity_to_move <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  IF from_asset_id = to_asset_id THEN
    RAISE EXCEPTION 'Choose a different parent asset';
  END IF;

  SELECT *
  INTO v_source_link
  FROM public.asset_consumables
  WHERE asset_id = from_asset_id
    AND consumable_type_id = target_consumable_type_id
    AND detached_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source parent does not have that consumable attached';
  END IF;

  IF v_source_link.quantity < quantity_to_move THEN
    RAISE EXCEPTION 'Cannot move more consumables than the source parent has attached';
  END IF;

  SELECT *
  INTO v_target_link
  FROM public.asset_consumables
  WHERE asset_id = to_asset_id
    AND consumable_type_id = target_consumable_type_id
    AND detached_at IS NULL
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.asset_consumables
    SET
      quantity = quantity + quantity_to_move,
      follows_parent = target_follows_parent,
      notes = COALESCE(NULLIF(TRIM(reassign_notes), ''), notes)
    WHERE id = v_target_link.id;
  ELSE
    INSERT INTO public.asset_consumables (
      asset_id,
      consumable_type_id,
      quantity,
      follows_parent,
      notes,
      attached_by
    )
    VALUES (
      to_asset_id,
      target_consumable_type_id,
      quantity_to_move,
      target_follows_parent,
      NULLIF(TRIM(reassign_notes), ''),
      v_actor
    );
  END IF;

  IF v_source_link.quantity = quantity_to_move THEN
    UPDATE public.asset_consumables
    SET
      detached_by = v_actor,
      detached_at = now(),
      notes = COALESCE(NULLIF(TRIM(reassign_notes), ''), notes)
    WHERE id = v_source_link.id;
  ELSE
    UPDATE public.asset_consumables
    SET quantity = quantity - quantity_to_move
    WHERE id = v_source_link.id;
  END IF;

  INSERT INTO public.consumable_history (
    consumable_type_id,
    asset_id,
    quantity,
    action,
    performed_by,
    notes
  )
  VALUES
    (
      target_consumable_type_id,
      from_asset_id,
      quantity_to_move,
      'consumable_reassigned_from',
      v_actor,
      COALESCE(NULLIF(TRIM(reassign_notes), ''), 'Consumable quantity reassigned from parent asset.')
    ),
    (
      target_consumable_type_id,
      to_asset_id,
      quantity_to_move,
      'consumable_reassigned_to',
      v_actor,
      COALESCE(NULLIF(TRIM(reassign_notes), ''), 'Consumable quantity reassigned to parent asset.')
    );

  INSERT INTO public.asset_history (
    asset_id,
    action,
    performed_by,
    notes
  )
  VALUES
    (
      from_asset_id,
      'consumable_reassigned',
      v_actor,
      COALESCE(NULLIF(TRIM(reassign_notes), ''), format('Consumable reassigned out. Quantity: %s', quantity_to_move))
    ),
    (
      to_asset_id,
      'consumable_reassigned',
      v_actor,
      COALESCE(NULLIF(TRIM(reassign_notes), ''), format('Consumable reassigned in. Quantity: %s', quantity_to_move))
    );

  RETURN jsonb_build_object('success', true, 'moved_quantity', quantity_to_move);
END;
$$;

GRANT EXECUTE ON FUNCTION public.reassign_consumable_to_asset(uuid, uuid, uuid, integer, boolean, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_override_parent_without_consumables(
  target_asset_ids uuid[],
  override_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_asset_id uuid;
  v_count integer := 0;
BEGIN
  IF v_actor IS NULL OR NOT public.is_admin(v_actor) THEN
    RAISE EXCEPTION 'Only admins can override missing consumables on a parent asset';
  END IF;

  IF COALESCE(array_length(target_asset_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Select at least one parent asset';
  END IF;

  FOREACH v_asset_id IN ARRAY target_asset_ids LOOP
    INSERT INTO public.asset_history (
      asset_id,
      action,
      performed_by,
      notes
    )
    VALUES (
      v_asset_id,
      'consumable_override',
      v_actor,
      COALESCE(NULLIF(TRIM(override_notes), ''), 'Admin override applied for missing linked consumables.')
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'overridden_count', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_override_parent_without_consumables(uuid[], text) TO authenticated;

NOTIFY pgrst, 'reload schema';

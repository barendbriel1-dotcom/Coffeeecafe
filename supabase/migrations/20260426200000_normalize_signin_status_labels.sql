create or replace function public.sign_in_assets(
  signin_payload jsonb,
  target_location_id uuid,
  notes text default null,
  note_prefix text default 'Manual sign-in completed.'
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
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
begin
  if v_actor is null or not (public.is_admin(v_actor) or public.has_role(v_actor, 'asset_manager')) then
    raise exception 'Only admins or Assets Managers can sign items in';
  end if;

  if target_location_id is null then
    raise exception 'Select a return location before confirming';
  end if;

  if jsonb_typeof(signin_payload) <> 'array' or jsonb_array_length(signin_payload) = 0 then
    raise exception 'No sign-in items were provided';
  end if;

  if public.has_role(v_actor, 'asset_manager') then
    select asset_manager_location_id
    into v_locked_location_id
    from public.profiles
    where id = v_actor;

    if v_locked_location_id is null then
      raise exception 'Assets Manager is missing a locked location';
    end if;

    if target_location_id <> v_locked_location_id then
      raise exception 'Assets Managers can only sign items into their locked location';
    end if;
  end if;

  select name
  into v_location_name
  from public.locations
  where id = target_location_id;

  if v_location_name is null then
    raise exception 'Return location was not found';
  end if;

  v_note_text := coalesce(nullif(trim(notes), ''), note_prefix);

  for v_entry in
    select value
    from jsonb_array_elements(signin_payload)
  loop
    v_asset_id := (v_entry ->> 'asset_id')::uuid;
    v_next_status_text := lower(trim(coalesce(v_entry ->> 'next_status', 'available')));
    v_next_status_text := replace(replace(v_next_status_text, '-', '_'), ' ', '_');

    if v_next_status_text in ('available', 'returned') then
      v_next_status_text := 'available';
    elsif v_next_status_text in ('out_for_repair', 'out_for_repairs', 'sign_out_for_repair', 'sign_out_for_repairs', 'signed_out_for_repair', 'signed_out_for_repairs', 'repair', 'repairs', 'maintenance') then
      v_next_status_text := 'out_for_repairs';
    elsif v_next_status_text in ('damaged', 'damage') then
      v_next_status_text := 'damaged';
    else
      raise exception 'Invalid next status for scanned or selected item: %', v_entry ->> 'next_status';
    end if;

    v_next_status := v_next_status_text::public.asset_status;

    select
      id,
      code,
      status,
      department_id,
      current_holder
    into v_asset
    from public.assets
    where id = v_asset_id
    for update;

    if not found then
      raise exception 'Asset % could not be found', v_asset_id;
    end if;

    if v_locked_location_id is not null and v_asset.department_id <> v_locked_location_id then
      raise exception 'Asset % is outside the locked Assets Manager location', v_asset.code;
    end if;

    if v_asset.status <> 'signed_out' then
      raise exception 'Asset % is not currently signed out', v_asset.code;
    end if;

    select
      si.id,
      si.signout_id
    into v_active_signout
    from public.signout_items si
    where si.asset_id = v_asset_id
      and si.returned = false
    order by si.created_at desc
    limit 1
    for update;

    if not found then
      raise exception 'Asset % is missing an active sign-out record', v_asset.code;
    end if;

    update public.assets
    set
      status = v_next_status,
      current_holder = null,
      current_location_id = target_location_id,
      updated_at = now()
    where id = v_asset_id;

    update public.signout_items
    set returned = true
    where id = v_active_signout.id;

    insert into public.asset_history (
      asset_id,
      action,
      performed_by,
      from_user,
      notes
    )
    values (
      v_asset_id,
      case
        when v_next_status = 'available' then 'signed_in'
        when v_next_status = 'out_for_repairs' then 'sent_for_repairs'
        else 'marked_damaged'
      end,
      v_actor,
      v_asset.current_holder,
      format('%s Returned to %s.', v_note_text, v_location_name)
    );

    v_signout_ids := array_append(v_signout_ids, v_active_signout.signout_id);
    v_processed_count := v_processed_count + 1;

    if v_next_status = 'available' then
      v_available_count := v_available_count + 1;
    elsif v_next_status = 'out_for_repairs' then
      v_repairs_count := v_repairs_count + 1;
    else
      v_damaged_count := v_damaged_count + 1;
    end if;
  end loop;

  for v_signout_id in
    select distinct signout_id
    from unnest(v_signout_ids) as signout_id
  loop
    if not exists (
      select 1
      from public.signout_items
      where signout_id = v_signout_id
        and returned = false
    ) then
      update public.signouts
      set
        status = 'returned',
        signed_in_at = now(),
        signed_in_by = v_actor,
        updated_at = now()
      where id = v_signout_id;
    end if;
  end loop;

  return jsonb_build_object(
    'success', true,
    'processed_count', v_processed_count,
    'available_count', v_available_count,
    'repairs_count', v_repairs_count,
    'damaged_count', v_damaged_count
  );
end;
$$;

grant execute on function public.sign_in_assets(jsonb, uuid, text, text) to authenticated;

create or replace function public.sign_in_assets_safe(
  signin_payload jsonb,
  target_location_id uuid,
  notes text default null,
  note_prefix text default 'Manual sign-in completed.'
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_entry jsonb;
  v_next_status_text text;
  v_sanitized_payload jsonb := '[]'::jsonb;
begin
  if jsonb_typeof(signin_payload) <> 'array' then
    raise exception 'No sign-in items were provided';
  end if;

  for v_entry in
    select value
    from jsonb_array_elements(signin_payload)
  loop
    v_next_status_text := lower(trim(coalesce(v_entry ->> 'next_status', 'available')));
    v_next_status_text := replace(replace(v_next_status_text, '-', '_'), ' ', '_');

    if v_next_status_text in ('available', 'returned') then
      v_next_status_text := 'available';
    elsif v_next_status_text in ('out_for_repair', 'out_for_repairs', 'sign_out_for_repair', 'sign_out_for_repairs', 'signed_out_for_repair', 'signed_out_for_repairs', 'repair', 'repairs', 'maintenance') then
      v_next_status_text := 'out_for_repairs';
    elsif v_next_status_text in ('damaged', 'damage') then
      v_next_status_text := 'damaged';
    else
      raise exception 'Invalid next status for scanned or selected item: %', v_entry ->> 'next_status';
    end if;

    v_sanitized_payload := v_sanitized_payload || jsonb_build_array(
      jsonb_build_object(
        'asset_id', v_entry ->> 'asset_id',
        'next_status', v_next_status_text
      )
    );
  end loop;

  return public.sign_in_assets(v_sanitized_payload, target_location_id, notes, note_prefix);
end;
$$;

grant execute on function public.sign_in_assets_safe(jsonb, uuid, text, text) to authenticated;

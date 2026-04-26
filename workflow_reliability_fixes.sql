create or replace function public.admin_assign_user_role(
  target_user_id uuid,
  next_role public.app_role,
  next_asset_manager_location_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null or not public.is_admin(auth.uid()) then
    raise exception 'Only admins can assign roles';
  end if;

  if target_user_id = auth.uid() and next_role <> 'admin' then
    raise exception 'You cannot remove your own admin access';
  end if;

  if next_role = 'asset_manager' and next_asset_manager_location_id is null then
    raise exception 'Assets Manager requires a locked location';
  end if;

  delete from public.user_roles
  where user_id = target_user_id;

  insert into public.user_roles (user_id, role)
  values (target_user_id, next_role);

  update public.profiles
  set asset_manager_location_id = case
    when next_role = 'asset_manager' then next_asset_manager_location_id
    else null
  end,
  updated_at = now()
  where id = target_user_id;

  return jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'role', next_role
  );
end;
$$;

grant execute on function public.admin_assign_user_role(uuid, public.app_role, uuid) to authenticated;

create or replace function public.sign_out_assets(
  target_asset_ids uuid[],
  notes text default null,
  package_name text default null,
  recipient_user_id uuid default null,
  history_notes_by_asset jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_recipient uuid := coalesce(recipient_user_id, auth.uid());
  v_asset_id uuid;
  v_asset record;
  v_signout_id uuid;
  v_traveling_location_id uuid;
  v_locked_location_id uuid;
  v_count integer := 0;
begin
  if v_actor is null or not public.is_staff_or_admin(v_actor) then
    raise exception 'Only staff, admins, or Assets Managers can sign items out';
  end if;

  if coalesce(array_length(target_asset_ids, 1), 0) = 0 then
    raise exception 'Select at least one asset';
  end if;

  if public.has_role(v_actor, 'asset_manager') then
    select asset_manager_location_id
    into v_locked_location_id
    from public.profiles
    where id = v_actor;

    if v_locked_location_id is null then
      raise exception 'Assets Manager is missing a locked location';
    end if;
  end if;

  select id
  into v_traveling_location_id
  from public.locations
  where name = 'Traveling'
  limit 1;

  if v_traveling_location_id is null then
    raise exception 'Traveling location was not found';
  end if;

  insert into public.signouts (
    signed_out_by,
    signed_out_to,
    to_department_id,
    package_name,
    notes,
    expected_return
  )
  values (
    v_actor,
    v_recipient,
    v_traveling_location_id,
    package_name,
    nullif(trim(notes), ''),
    now()
  )
  returning id into v_signout_id;

  foreach v_asset_id in array target_asset_ids loop
    select
      id,
      code,
      status,
      department_id,
      locked_by,
      locked_at
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

    if v_asset.status <> 'available' then
      raise exception 'Asset % is no longer available', v_asset.code;
    end if;

    if v_asset.locked_by is not null
      and v_asset.locked_at is not null
      and v_asset.locked_by <> v_actor
      and v_asset.locked_at > now() - interval '15 minutes'
    then
      raise exception 'Asset % is locked by another workflow', v_asset.code;
    end if;

    insert into public.signout_items (signout_id, asset_id)
    values (v_signout_id, v_asset_id);

    update public.assets
    set
      status = 'signed_out',
      current_holder = v_recipient,
      current_location_id = v_traveling_location_id,
      locked_by = null,
      locked_at = null,
      updated_at = now()
    where id = v_asset_id;

    insert into public.asset_history (
      asset_id,
      action,
      performed_by,
      to_user,
      notes
    )
    values (
      v_asset_id,
      'signed_out',
      v_actor,
      v_recipient,
      case
        when history_notes_by_asset is not null and history_notes_by_asset ? v_asset_id::text then
          history_notes_by_asset ->> v_asset_id::text
        when package_name is not null and nullif(trim(package_name), '') is not null then
          format('Group: %s%s', package_name, case when nullif(trim(notes), '') is not null then format(' | %s', trim(notes)) else '' end)
        else
          coalesce(nullif(trim(notes), ''), 'Location moved to Traveling.')
      end
    );

    v_count := v_count + 1;
  end loop;

  return jsonb_build_object(
    'success', true,
    'signout_id', v_signout_id,
    'processed_count', v_count
  );
end;
$$;

grant execute on function public.sign_out_assets(uuid[], text, text, uuid, jsonb) to authenticated;

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
    v_next_status := (v_entry ->> 'next_status')::public.asset_status;

    if v_next_status not in ('available', 'out_for_repairs', 'damaged') then
      raise exception 'Invalid next status for scanned or selected item';
    end if;

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

create or replace function public.approve_asset_request(
  target_request_id uuid,
  admin_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_request record;
  v_asset record;
  v_traveling_location_id uuid;
  v_signout_id uuid;
begin
  if v_actor is null or not public.is_admin(v_actor) then
    raise exception 'Only admins can approve requests';
  end if;

  select *
  into v_request
  from public.asset_requests
  where id = target_request_id
  for update;

  if not found then
    raise exception 'Request could not be found';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Only pending requests can be approved';
  end if;

  if v_request.asset_id is null then
    update public.asset_requests
    set
      status = 'approved',
      reviewed_by = v_actor,
      reviewed_at = now(),
      admin_notes = admin_notes,
      updated_at = now()
    where id = target_request_id;

    return jsonb_build_object(
      'success', true,
      'request_id', target_request_id,
      'signout_id', null
    );
  end if;

  select
    id,
    code,
    status,
    locked_by,
    locked_at
  into v_asset
  from public.assets
  where id = v_request.asset_id
  for update;

  if not found then
    raise exception 'The requested asset could not be found anymore';
  end if;

  if v_asset.status <> 'available' then
    raise exception '% is no longer available, so this request cannot be auto-approved', v_asset.code;
  end if;

  if v_asset.locked_by is not null
    and v_asset.locked_at is not null
    and v_asset.locked_by <> v_actor
    and v_asset.locked_at > now() - interval '15 minutes'
  then
    raise exception '% is currently locked by another workflow. Try again after the lock is cleared', v_asset.code;
  end if;

  select id
  into v_traveling_location_id
  from public.locations
  where name = 'Traveling'
  limit 1;

  if v_traveling_location_id is null then
    raise exception 'Traveling location was not found';
  end if;

  insert into public.signouts (
    signed_out_by,
    signed_out_to,
    to_department_id,
    notes,
    status
  )
  values (
    v_actor,
    v_request.requested_by,
    v_traveling_location_id,
    format(
      'Auto-approved request: %s%s',
      coalesce(nullif(v_request.needed_for, ''), 'No details'),
      case when nullif(trim(admin_notes), '') is not null then format(' | %s', trim(admin_notes)) else '' end
    ),
    'active'
  )
  returning id into v_signout_id;

  insert into public.signout_items (signout_id, asset_id)
  values (v_signout_id, v_request.asset_id);

  update public.assets
  set
    status = 'signed_out',
    current_holder = v_request.requested_by,
    current_location_id = v_traveling_location_id,
    locked_by = null,
    locked_at = null,
    updated_at = now()
  where id = v_request.asset_id;

  insert into public.asset_history (
    asset_id,
    action,
    performed_by,
    to_user,
    notes
  )
  values (
    v_request.asset_id,
    'signed_out',
    v_actor,
    v_request.requested_by,
    format('Auto-approved request ID: %s', v_request.id)
  );

  update public.asset_requests
  set
    status = 'approved',
    reviewed_by = v_actor,
    reviewed_at = now(),
    admin_notes = admin_notes,
    updated_at = now()
  where id = target_request_id;

  return jsonb_build_object(
    'success', true,
    'request_id', target_request_id,
    'signout_id', v_signout_id
  );
end;
$$;

grant execute on function public.approve_asset_request(uuid, text) to authenticated;

notify pgrst, 'reload schema';

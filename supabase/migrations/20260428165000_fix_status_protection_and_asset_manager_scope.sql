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
      current_location_id,
      locked_by,
      locked_at
    into v_asset
    from public.assets
    where id = v_asset_id
    for update;

    if not found then
      raise exception 'Asset % could not be found', v_asset_id;
    end if;

    if v_locked_location_id is not null and coalesce(v_asset.current_location_id, v_asset.department_id) <> v_locked_location_id then
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

notify pgrst, 'reload schema';

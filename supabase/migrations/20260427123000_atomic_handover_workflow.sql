-- Keep handover creation and responses atomic so assets cannot be left in a partial workflow state.

create or replace function public.initiate_handover(
  target_asset_ids uuid[],
  recipient_user_id uuid,
  handover_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_asset_id uuid;
  v_asset record;
  v_handover_id uuid;
begin
  if v_actor is null or not public.is_staff_or_admin(v_actor) then
    raise exception 'Staff or Admin required';
  end if;

  if recipient_user_id is null or recipient_user_id = v_actor then
    raise exception 'Choose another user to receive the handover';
  end if;

  if coalesce(array_length(target_asset_ids, 1), 0) = 0 then
    raise exception 'Select at least one asset';
  end if;

  foreach v_asset_id in array target_asset_ids loop
    select id, code, status, current_holder
    into v_asset
    from public.assets
    where id = v_asset_id
    for update;

    if not found then
      raise exception 'Asset % could not be found', v_asset_id;
    end if;

    if v_asset.current_holder <> v_actor or v_asset.status <> 'signed_out' then
      raise exception 'Asset % is not available for handover by this user', v_asset.code;
    end if;
  end loop;

  insert into public.handovers (from_user, to_user, notes)
  values (v_actor, recipient_user_id, nullif(trim(handover_notes), ''))
  returning id into v_handover_id;

  insert into public.handover_items (handover_id, asset_id)
  select v_handover_id, unnest(target_asset_ids);

  update public.assets
  set status = 'in_handover'
  where id = any(target_asset_ids);

  return v_handover_id;
end;
$$;

grant execute on function public.initiate_handover(uuid[], uuid, text) to authenticated;

create or replace function public.respond_handover(
  target_handover_id uuid,
  accept_handover boolean
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_handover record;
  v_asset_ids uuid[];
  v_updated_count integer;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_handover
  from public.handovers
  where id = target_handover_id
  for update;

  if not found then
    raise exception 'Handover could not be found';
  end if;

  if v_handover.to_user <> v_actor then
    raise exception 'Only the recipient can respond to this handover';
  end if;

  if v_handover.status <> 'pending' then
    raise exception 'This handover has already been processed';
  end if;

  select array_agg(asset_id)
  into v_asset_ids
  from public.handover_items
  where handover_id = target_handover_id;

  if coalesce(array_length(v_asset_ids, 1), 0) = 0 then
    raise exception 'This handover has no assets';
  end if;

  update public.handovers
  set
    status = case when accept_handover then 'accepted'::public.handover_status else 'rejected'::public.handover_status end,
    responded_at = now()
  where id = target_handover_id;

  if accept_handover then
    update public.assets
    set status = 'signed_out', current_holder = v_actor
    where id = any(v_asset_ids)
      and status = 'in_handover'
      and current_holder = v_handover.from_user;
    get diagnostics v_updated_count = row_count;

    if v_updated_count <> array_length(v_asset_ids, 1) then
      raise exception 'One or more handover assets are no longer ready to transfer';
    end if;

    insert into public.asset_history (asset_id, action, performed_by, from_user, to_user)
    select asset_id, 'handover_accepted', v_actor, v_handover.from_user, v_actor
    from public.handover_items
    where handover_id = target_handover_id;
  else
    update public.assets
    set status = 'signed_out'
    where id = any(v_asset_ids)
      and status = 'in_handover'
      and current_holder = v_handover.from_user;
    get diagnostics v_updated_count = row_count;

    if v_updated_count <> array_length(v_asset_ids, 1) then
      raise exception 'One or more handover assets are no longer ready to reject';
    end if;
  end if;
end;
$$;

grant execute on function public.respond_handover(uuid, boolean) to authenticated;

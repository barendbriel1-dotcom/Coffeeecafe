-- Damage report workflow: table, policies, conclusion email queue, and safe sign-in creation.

create table if not exists public.damage_reports (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  asset_code text not null,
  asset_name text not null,
  assigned_to uuid not null references auth.users(id),
  reported_by uuid not null references auth.users(id),
  description text,
  damaged_date date,
  damaged_time time,
  damage_type text,
  other_details text,
  admin_conclusion_notes text,
  admin_conclusion_status public.asset_status,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

alter table public.damage_reports enable row level security;

drop policy if exists "damage_reports_read" on public.damage_reports;
create policy "damage_reports_read" on public.damage_reports
  for select to authenticated
  using (auth.uid() = assigned_to or public.is_admin(auth.uid()));

drop policy if exists "damage_reports_update_own" on public.damage_reports;
create policy "damage_reports_update_own" on public.damage_reports
  for update to authenticated
  using (auth.uid() = assigned_to and status = 'pending')
  with check (auth.uid() = assigned_to);

drop policy if exists "damage_reports_admin_insert" on public.damage_reports;
create policy "damage_reports_admin_insert" on public.damage_reports
  for insert to authenticated
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(), 'asset_manager'));

drop policy if exists "damage_reports_admin_update" on public.damage_reports;
create policy "damage_reports_admin_update" on public.damage_reports
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "damage_reports_admin_delete" on public.damage_reports;
create policy "damage_reports_admin_delete" on public.damage_reports
  for delete to authenticated
  using (public.is_admin(auth.uid()));

create table if not exists public.email_notifications (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'error')),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  error_message text
);

alter table public.email_notifications enable row level security;

drop policy if exists "admin_all_email_notifications" on public.email_notifications;
create policy "admin_all_email_notifications" on public.email_notifications
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create or replace function public.on_damage_report_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.admin_conclusion_status is not null and old.admin_conclusion_status is null then
    insert into public.email_notifications (to_email, subject, body)
    values (
      'Barend@encounterchurch.co.za',
      format('Damage Report Concluded: %s (%s)', new.asset_name, new.asset_code),
      format(
        'An admin has concluded the damage report for: %s (%s).' || chr(10) ||
        'Final Status: %s' || chr(10) ||
        'Admin Notes: %s' || chr(10) ||
        'Reviewed on: %s',
        new.asset_name,
        new.asset_code,
        new.admin_conclusion_status,
        coalesce(new.admin_conclusion_notes, ''),
        new.reviewed_at
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists tr_damage_report_completed on public.damage_reports;
create trigger tr_damage_report_completed
  after update on public.damage_reports
  for each row
  execute function public.on_damage_report_completed();

drop function if exists public.sign_in_assets_safe(jsonb, uuid, text, text);

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
    select asset_manager_location_id into v_locked_location_id
    from public.profiles
    where id = v_actor;

    if v_locked_location_id is null then
      raise exception 'Assets Manager is missing a locked location';
    end if;

    if target_location_id <> v_locked_location_id then
      raise exception 'Assets Managers can only sign items into their locked location';
    end if;
  end if;

  select name into v_location_name
  from public.locations
  where id = target_location_id;

  if v_location_name is null then
    raise exception 'Return location was not found';
  end if;

  v_note_text := coalesce(nullif(trim(notes), ''), note_prefix);

  for v_entry in select value from jsonb_array_elements(signin_payload) loop
    v_asset_id := (v_entry ->> 'asset_id')::uuid;
    v_next_status_text := lower(trim(coalesce(v_entry ->> 'next_status', 'available')));
    v_next_status_text := replace(replace(v_next_status_text, '-', '_'), ' ', '_');

    if v_next_status_text in ('available', 'returned') then
      v_next_status_text := 'available';
    elsif v_next_status_text in ('out_for_repair', 'out_for_repairs', 'out_for__repairs', 'sign_out_for_repair', 'sign_out_for_repairs', 'signed_out_for_repair', 'signed_out_for_repairs', 'repair', 'repairs', 'maintenance') then
      v_next_status_text := 'out_for_repairs';
    elsif v_next_status_text in ('damaged', 'damage') then
      v_next_status_text := 'damaged';
    else
      raise exception 'Invalid next status for scanned or selected item: %', v_entry ->> 'next_status';
    end if;

    v_next_status := v_next_status_text::public.asset_status;

    select id, code, name, status, department_id, current_holder
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

    select si.id, si.signout_id
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

    if v_next_status = 'damaged' and v_asset.current_holder is not null then
      insert into public.damage_reports (asset_id, asset_code, asset_name, assigned_to, reported_by)
      values (v_asset_id, v_asset.code, v_asset.name, v_asset.current_holder, v_actor);
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

    insert into public.asset_history (asset_id, action, performed_by, from_user, notes)
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

  for v_signout_id in select distinct signout_id from unnest(v_signout_ids) as signout_id loop
    if not exists (
      select 1
      from public.signout_items
      where signout_id = v_signout_id
        and returned = false
    ) then
      update public.signouts
      set status = 'returned',
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

grant execute on function public.sign_in_assets_safe(jsonb, uuid, text, text) to authenticated;

notify pgrst, 'reload schema';

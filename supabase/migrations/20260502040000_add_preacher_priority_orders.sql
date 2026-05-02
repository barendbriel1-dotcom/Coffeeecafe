create or replace function public.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = required_role
  );
$$;

create or replace function public.has_any_role(required_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = any(required_roles)
  );
$$;

create or replace function public.is_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and approved = true
  );
$$;

create or replace function public.is_approved_pastor(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    join public.user_roles on user_roles.user_id = profiles.id
    where profiles.id = target_user_id
      and profiles.approved = true
      and user_roles.role = 'pastor'::public.app_role
  );
$$;

create or replace function public.prevent_non_operator_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status
     and not public.has_role('operator'::public.app_role) then
    raise exception 'Only operators can change order status.';
  end if;

  return new;
end;
$$;

alter table public.coffee_orders
add column if not exists order_type text not null default 'normal',
add column if not exists guest_name text,
add column if not exists guest_details text,
add column if not exists custom_extra_items text,
add column if not exists preacher_extras jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'coffee_orders_order_type_check'
  ) then
    alter table public.coffee_orders
    add constraint coffee_orders_order_type_check
    check (order_type in ('normal', 'preacher'));
  end if;
end $$;

update public.coffee_orders
set order_type = 'normal'
where order_type is null;

drop policy if exists "Pastors and operators can create orders" on public.coffee_orders;
drop policy if exists "Approved users can read relevant orders" on public.coffee_orders;
drop policy if exists "Admins and operators can update orders" on public.coffee_orders;

create policy "Pastors and operators can create orders"
on public.coffee_orders
for insert
to authenticated
with check (
  public.is_approved()
  and auth.uid() = created_by
  and (
    (
      public.has_role('pastor'::public.app_role)
      and order_type = 'normal'
      and pastor_id = auth.uid()
      and public.is_approved_pastor(auth.uid())
    )
    or (
      public.has_role('operator'::public.app_role)
      and order_type = 'normal'
      and pastor_id is not null
      and public.is_approved_pastor(pastor_id)
    )
    or (
      public.has_role('operator'::public.app_role)
      and order_type = 'preacher'
      and (
        (pastor_id is not null and public.is_approved_pastor(pastor_id))
        or (pastor_id is null and guest_name is not null and length(trim(guest_name)) > 0)
      )
    )
  )
);

create policy "Approved users can read relevant orders"
on public.coffee_orders
for select
to authenticated
using (
  public.is_approved()
  and (
    public.has_any_role(array['admin', 'operator']::public.app_role[])
    or auth.uid() = created_by
    or auth.uid() = pastor_id
  )
);

create policy "Admins and operators can update orders"
on public.coffee_orders
for update
to authenticated
using (
  public.is_approved()
  and public.has_any_role(array['admin', 'operator']::public.app_role[])
)
with check (
  public.is_approved()
  and public.has_any_role(array['admin', 'operator']::public.app_role[])
);

drop trigger if exists coffee_orders_restrict_status_change on public.coffee_orders;
create trigger coffee_orders_restrict_status_change
before update on public.coffee_orders
for each row execute function public.prevent_non_operator_status_change();

notify pgrst, 'reload schema';

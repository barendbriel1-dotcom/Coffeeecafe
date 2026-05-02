alter type public.app_role add value if not exists 'cafe';

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

create or replace function public.can_submit_pastor_order(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select count(*) < 3
  from public.coffee_orders
  where pastor_id = target_user_id
    and date(timezone('Africa/Johannesburg', created_at)) = date(timezone('Africa/Johannesburg', now()));
$$;

create or replace function public.enforce_order_workflow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.pastor_id is not null and not public.can_submit_pastor_order(new.pastor_id) then
      raise exception 'Pastors can only have 3 orders per day.';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.status is distinct from old.status
       and not public.has_role('cafe'::public.app_role) then
      raise exception 'Only cafe can change order status.';
    end if;

    if (
      new.pastor_id is distinct from old.pastor_id
      or new.order_type is distinct from old.order_type
      or new.recipient_name is distinct from old.recipient_name
      or new.guest_name is distinct from old.guest_name
      or new.guest_details is distinct from old.guest_details
      or new.custom_extra_items is distinct from old.custom_extra_items
      or new.preacher_extras is distinct from old.preacher_extras
      or new.coffee_type is distinct from old.coffee_type
      or new.milk_type is distinct from old.milk_type
      or new.sugar_type is distinct from old.sugar_type
      or new.milk_heat is distinct from old.milk_heat
      or new.notes is distinct from old.notes
    ) and not public.has_role('admin'::public.app_role) then
      raise exception 'Only admins can edit order details.';
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists coffee_orders_restrict_status_change on public.coffee_orders;
drop trigger if exists coffee_orders_enforce_workflow on public.coffee_orders;
create trigger coffee_orders_enforce_workflow
before insert or update on public.coffee_orders
for each row execute function public.enforce_order_workflow();

drop policy if exists "Pastors and operators can create orders" on public.coffee_orders;
drop policy if exists "Approved users can read relevant orders" on public.coffee_orders;
drop policy if exists "Admins and operators can update orders" on public.coffee_orders;
drop policy if exists "Admins and cafe can update orders" on public.coffee_orders;
drop policy if exists "Admins can delete orders" on public.coffee_orders;

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
    public.has_any_role(array['admin', 'operator', 'cafe']::public.app_role[])
    or auth.uid() = created_by
    or auth.uid() = pastor_id
  )
);

create policy "Admins and cafe can update orders"
on public.coffee_orders
for update
to authenticated
using (
  public.is_approved()
  and public.has_any_role(array['admin', 'cafe']::public.app_role[])
)
with check (
  public.is_approved()
  and public.has_any_role(array['admin', 'cafe']::public.app_role[])
);

create policy "Admins can delete orders"
on public.coffee_orders
for delete
to authenticated
using (
  public.is_approved()
  and public.has_role('admin'::public.app_role)
);

notify pgrst, 'reload schema';

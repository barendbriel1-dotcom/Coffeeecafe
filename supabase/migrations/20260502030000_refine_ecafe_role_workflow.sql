alter table public.user_roles
alter column role drop default;

alter table public.profiles
alter column requested_role set default 'pastor';

alter table public.coffee_orders
add column if not exists pastor_id uuid references auth.users(id) on delete set null;

update public.coffee_orders
set pastor_id = created_by
where pastor_id is null
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = coffee_orders.created_by
      and user_roles.role = 'pastor'
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, requested_role, approved)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(
      case
        when new.raw_user_meta_data ->> 'requested_role' in ('pastor', 'operator')
          then (new.raw_user_meta_data ->> 'requested_role')::public.app_role
        else null
      end,
      'pastor'::public.app_role
    ),
    false
  );

  return new;
end;
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
      and user_roles.role = 'pastor'
  );
$$;

create or replace function public.prevent_non_operator_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status and not public.has_role('operator') then
    raise exception 'Only operators can change order status.';
  end if;

  return new;
end;
$$;

drop trigger if exists coffee_orders_restrict_status_change on public.coffee_orders;
create trigger coffee_orders_restrict_status_change
before update on public.coffee_orders
for each row execute function public.prevent_non_operator_status_change();

drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Admins can read all roles" on public.user_roles;
drop policy if exists "Admins can insert roles" on public.user_roles;
drop policy if exists "Admins can update roles" on public.user_roles;
drop policy if exists "Admins can delete roles" on public.user_roles;
drop policy if exists "Users can read their own coffee preference" on public.coffee_preferences;
drop policy if exists "Users can insert their own coffee preference" on public.coffee_preferences;
drop policy if exists "Users can update their own coffee preference" on public.coffee_preferences;
drop policy if exists "Approved app users can create orders" on public.coffee_orders;
drop policy if exists "Order users can read orders" on public.coffee_orders;
drop policy if exists "Operators and admins can update orders" on public.coffee_orders;

create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.has_role('admin'));

create policy "Admins can update all profiles"
on public.profiles
for update
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "Operators can read approved pastor profiles"
on public.profiles
for select
to authenticated
using (
  public.has_role('operator')
  and approved = true
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = profiles.id
      and user_roles.role = 'pastor'
  )
);

create policy "Admins can read all roles"
on public.user_roles
for select
to authenticated
using (public.has_role('admin'));

create policy "Operators can read pastor roles"
on public.user_roles
for select
to authenticated
using (
  public.has_role('operator')
  and role = 'pastor'
);

create policy "Admins can insert roles"
on public.user_roles
for insert
to authenticated
with check (public.has_role('admin'));

create policy "Admins can update roles"
on public.user_roles
for update
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "Admins can delete roles"
on public.user_roles
for delete
to authenticated
using (public.has_role('admin'));

create policy "Pastors can read their own coffee preference"
on public.coffee_preferences
for select
to authenticated
using (
  (public.is_approved() and auth.uid() = user_id and public.has_role('pastor'))
  or public.has_role('admin')
);

create policy "Pastors can insert their own coffee preference"
on public.coffee_preferences
for insert
to authenticated
with check (
  public.is_approved()
  and auth.uid() = user_id
  and public.has_role('pastor')
);

create policy "Pastors can update their own coffee preference"
on public.coffee_preferences
for update
to authenticated
using (
  public.is_approved()
  and auth.uid() = user_id
  and public.has_role('pastor')
)
with check (
  public.is_approved()
  and auth.uid() = user_id
  and public.has_role('pastor')
);

create policy "Pastors and operators can create orders"
on public.coffee_orders
for insert
to authenticated
with check (
  public.is_approved()
  and auth.uid() = created_by
  and (
    (
      public.has_role('pastor')
      and pastor_id = auth.uid()
      and public.is_approved_pastor(auth.uid())
    )
    or (
      public.has_role('operator')
      and pastor_id is not null
      and public.is_approved_pastor(pastor_id)
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

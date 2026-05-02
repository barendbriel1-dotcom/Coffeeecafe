alter type public.app_role add value if not exists 'pastor';
alter type public.app_role add value if not exists 'operator';
alter type public.app_role add value if not exists 'volunteer';

alter table public.user_roles
alter column role set default 'volunteer';

alter table public.profiles
add column if not exists approved boolean not null default false,
add column if not exists approved_at timestamptz,
add column if not exists approved_by uuid references auth.users(id),
add column if not exists requested_role public.app_role not null default 'volunteer';

create table if not exists public.coffee_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coffee_type text not null check (coffee_type in ('Cappachino', 'Flat White', 'Cortado', 'Latte')),
  milk_type text not null check (milk_type in ('Fresh Milk', 'Lactose Free', 'Oat Milk', 'Almond Milk')),
  sugar_type text not null check (sugar_type in ('1 Sugar', '2 Suger', '3 Suger', 'Sweetner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.coffee_orders (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  recipient_name text not null,
  coffee_type text not null check (coffee_type in ('Cappachino', 'Flat White', 'Cortado', 'Latte')),
  milk_type text not null check (milk_type in ('Fresh Milk', 'Lactose Free', 'Oat Milk', 'Almond Milk')),
  sugar_type text not null check (sugar_type in ('1 Sugar', '2 Suger', '3 Suger', 'Sweetner')),
  notes text,
  status text not null default 'pending' check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coffee_preferences enable row level security;
alter table public.coffee_orders enable row level security;

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
    coalesce((new.raw_user_meta_data ->> 'requested_role')::public.app_role, 'volunteer'),
    false
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'volunteer')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists coffee_preferences_set_updated_at on public.coffee_preferences;
create trigger coffee_preferences_set_updated_at
before update on public.coffee_preferences
for each row execute function public.set_updated_at();

drop trigger if exists coffee_orders_set_updated_at on public.coffee_orders;
create trigger coffee_orders_set_updated_at
before update on public.coffee_orders
for each row execute function public.set_updated_at();

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

create policy "Admins can read all roles"
on public.user_roles
for select
to authenticated
using (public.has_role('admin'));

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

create policy "Users can read their own coffee preference"
on public.coffee_preferences
for select
to authenticated
using ((public.is_approved() and auth.uid() = user_id) or public.has_role('admin'));

create policy "Users can insert their own coffee preference"
on public.coffee_preferences
for insert
to authenticated
with check (public.is_approved() and auth.uid() = user_id);

create policy "Users can update their own coffee preference"
on public.coffee_preferences
for update
to authenticated
using (public.is_approved() and auth.uid() = user_id)
with check (public.is_approved() and auth.uid() = user_id);

create policy "Approved app users can create orders"
on public.coffee_orders
for insert
to authenticated
with check (
  public.is_approved()
  and public.has_any_role(array['admin', 'pastor', 'operator', 'volunteer']::public.app_role[])
  and auth.uid() = created_by
);

create policy "Order users can read orders"
on public.coffee_orders
for select
to authenticated
using (
  public.is_approved()
  and (
    auth.uid() = created_by
    or public.has_any_role(array['admin', 'operator']::public.app_role[])
  )
);

create policy "Operators and admins can update orders"
on public.coffee_orders
for update
to authenticated
using (public.is_approved() and public.has_any_role(array['admin', 'operator']::public.app_role[]))
with check (public.is_approved() and public.has_any_role(array['admin', 'operator']::public.app_role[]));

update public.profiles
set approved = true,
    approved_at = coalesce(approved_at, now())
where exists (
  select 1
  from public.user_roles
  where user_roles.user_id = profiles.id
    and user_roles.role = 'admin'
);

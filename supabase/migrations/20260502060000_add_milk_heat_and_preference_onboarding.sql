alter table public.coffee_preferences
add column if not exists milk_heat text not null default '55 degrees';

alter table public.coffee_orders
add column if not exists milk_heat text not null default '55 degrees';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'coffee_preferences_milk_heat_check'
  ) then
    alter table public.coffee_preferences
    add constraint coffee_preferences_milk_heat_check
    check (
      milk_heat in (
        '55 degrees', '56 degrees', '57 degrees', '58 degrees',
        '59 degrees', '60 degrees', '61 degrees', '62 degrees',
        '63 degrees', '64 degrees', '65 degrees', '66 degrees',
        '67 degrees', '68 degrees', '69 degrees', '70 degrees'
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'coffee_orders_milk_heat_check'
  ) then
    alter table public.coffee_orders
    add constraint coffee_orders_milk_heat_check
    check (
      milk_heat in (
        '55 degrees', '56 degrees', '57 degrees', '58 degrees',
        '59 degrees', '60 degrees', '61 degrees', '62 degrees',
        '63 degrees', '64 degrees', '65 degrees', '66 degrees',
        '67 degrees', '68 degrees', '69 degrees', '70 degrees'
      )
    );
  end if;
end $$;

drop policy if exists "Pastors can read their own coffee preference" on public.coffee_preferences;
drop policy if exists "Pastors can insert their own coffee preference" on public.coffee_preferences;
drop policy if exists "Pastors can update their own coffee preference" on public.coffee_preferences;

create policy "Coffee users can read their own coffee preference"
on public.coffee_preferences
for select
to authenticated
using (
  (
    public.is_approved()
    and auth.uid() = user_id
    and public.has_any_role(array['pastor', 'operator']::public.app_role[])
  )
  or public.has_role('admin'::public.app_role)
);

create policy "Coffee users can insert their own coffee preference"
on public.coffee_preferences
for insert
to authenticated
with check (
  public.is_approved()
  and auth.uid() = user_id
  and public.has_any_role(array['pastor', 'operator']::public.app_role[])
);

create policy "Coffee users can update their own coffee preference"
on public.coffee_preferences
for update
to authenticated
using (
  public.is_approved()
  and auth.uid() = user_id
  and public.has_any_role(array['pastor', 'operator']::public.app_role[])
)
with check (
  public.is_approved()
  and auth.uid() = user_id
  and public.has_any_role(array['pastor', 'operator']::public.app_role[])
);

notify pgrst, 'reload schema';

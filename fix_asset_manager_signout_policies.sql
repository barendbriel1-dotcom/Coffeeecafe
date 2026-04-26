create or replace function public.is_staff_or_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_role(_user_id, 'admin')
    or public.has_role(_user_id, 'staff')
    or public.has_role(_user_id, 'asset_manager');
$$;

drop policy if exists "signouts_staff_create" on public.signouts;
create policy "signouts_staff_create"
on public.signouts
for insert
to authenticated
with check (
  public.is_staff_or_admin(auth.uid())
  and signed_out_by = auth.uid()
);

drop policy if exists "signouts_admin_update" on public.signouts;
drop policy if exists "signouts_admin_or_asset_manager_update" on public.signouts;
create policy "signouts_admin_or_asset_manager_update"
on public.signouts
for update
to authenticated
using (
  public.is_admin(auth.uid())
  or public.has_role(auth.uid(), 'asset_manager')
)
with check (
  public.is_admin(auth.uid())
  or (public.has_role(auth.uid(), 'asset_manager') and signed_in_by = auth.uid())
);

drop policy if exists "signout_items_staff_create" on public.signout_items;
create policy "signout_items_staff_create"
on public.signout_items
for insert
to authenticated
with check (public.is_staff_or_admin(auth.uid()));

drop policy if exists "signout_items_admin_update" on public.signout_items;
drop policy if exists "signout_items_admin_or_asset_manager_update" on public.signout_items;
create policy "signout_items_admin_or_asset_manager_update"
on public.signout_items
for update
to authenticated
using (
  public.is_admin(auth.uid())
  or public.has_role(auth.uid(), 'asset_manager')
)
with check (
  public.is_admin(auth.uid())
  or public.has_role(auth.uid(), 'asset_manager')
);

notify pgrst, 'reload schema';

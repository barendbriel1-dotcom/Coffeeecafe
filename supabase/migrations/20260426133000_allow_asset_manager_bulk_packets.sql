drop policy if exists "bulk_packets_admin_select" on public.bulk_packets;
create policy "bulk_packets_admin_or_asset_manager_select"
on public.bulk_packets
for select
to authenticated
using (
  public.is_admin(auth.uid())
  or public.has_role(auth.uid(), 'asset_manager')
);

drop policy if exists "bulk_packets_admin_insert" on public.bulk_packets;
create policy "bulk_packets_admin_or_asset_manager_insert"
on public.bulk_packets
for insert
to authenticated
with check (
  (public.is_admin(auth.uid()) or public.has_role(auth.uid(), 'asset_manager'))
  and created_by = auth.uid()
);

drop policy if exists "bulk_packets_admin_update" on public.bulk_packets;
create policy "bulk_packets_admin_or_asset_manager_update"
on public.bulk_packets
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

drop policy if exists "bulk_packets_admin_delete" on public.bulk_packets;
create policy "bulk_packets_admin_or_asset_manager_delete"
on public.bulk_packets
for delete
to authenticated
using (
  public.is_admin(auth.uid())
  or public.has_role(auth.uid(), 'asset_manager')
);

drop policy if exists "bulk_packet_items_admin_select" on public.bulk_packet_items;
create policy "bulk_packet_items_admin_or_asset_manager_select"
on public.bulk_packet_items
for select
to authenticated
using (
  public.is_admin(auth.uid())
  or public.has_role(auth.uid(), 'asset_manager')
);

drop policy if exists "bulk_packet_items_admin_insert" on public.bulk_packet_items;
create policy "bulk_packet_items_admin_or_asset_manager_insert"
on public.bulk_packet_items
for insert
to authenticated
with check (
  public.is_admin(auth.uid())
  or public.has_role(auth.uid(), 'asset_manager')
);

drop policy if exists "bulk_packet_items_admin_update" on public.bulk_packet_items;
create policy "bulk_packet_items_admin_or_asset_manager_update"
on public.bulk_packet_items
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

drop policy if exists "bulk_packet_items_admin_delete" on public.bulk_packet_items;
create policy "bulk_packet_items_admin_or_asset_manager_delete"
on public.bulk_packet_items
for delete
to authenticated
using (
  public.is_admin(auth.uid())
  or public.has_role(auth.uid(), 'asset_manager')
);

notify pgrst, 'reload schema';

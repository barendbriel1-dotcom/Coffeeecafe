alter table public.bulk_packet_items
  add column if not exists preferred_asset_id uuid references public.assets(id) on delete set null;

create index if not exists idx_bulk_packet_items_preferred_asset_id
  on public.bulk_packet_items(preferred_asset_id);

notify pgrst, 'reload schema';

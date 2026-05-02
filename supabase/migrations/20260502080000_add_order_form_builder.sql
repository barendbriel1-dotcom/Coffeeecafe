create table if not exists public.order_form_options (
  id uuid primary key default gen_random_uuid(),
  form_type text not null check (form_type in ('normal', 'preacher')),
  field_key text not null check (field_key in ('coffee_type', 'milk_type', 'sugar_type', 'milk_heat', 'extra_item')),
  label text not null,
  sort_order integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (form_type, field_key, label)
);

alter table public.order_form_options enable row level security;

drop trigger if exists order_form_options_set_updated_at on public.order_form_options;
create trigger order_form_options_set_updated_at
before update on public.order_form_options
for each row execute function public.set_updated_at();

drop policy if exists "Approved users can read form options" on public.order_form_options;
drop policy if exists "Admins can manage form options" on public.order_form_options;

create policy "Approved users can read form options"
on public.order_form_options
for select
to authenticated
using (public.is_approved());

create policy "Admins can manage form options"
on public.order_form_options
for all
to authenticated
using (public.has_role('admin'::public.app_role))
with check (public.has_role('admin'::public.app_role));

insert into public.order_form_options (form_type, field_key, label, sort_order, active)
values
  ('normal', 'coffee_type', 'Cappachino', 1, true),
  ('normal', 'coffee_type', 'Flat White', 2, true),
  ('normal', 'coffee_type', 'Cortado', 3, true),
  ('normal', 'coffee_type', 'Latte', 4, true),
  ('normal', 'milk_type', 'Fresh Milk', 1, true),
  ('normal', 'milk_type', 'Lactose Free', 2, true),
  ('normal', 'milk_type', 'Oat Milk', 3, true),
  ('normal', 'milk_type', 'Almond Milk', 4, true),
  ('normal', 'sugar_type', '1 Sugar', 1, true),
  ('normal', 'sugar_type', '2 Suger', 2, true),
  ('normal', 'sugar_type', '3 Suger', 3, true),
  ('normal', 'sugar_type', 'Sweetner', 4, true),
  ('normal', 'milk_heat', '55 degrees', 1, true),
  ('normal', 'milk_heat', '56 degrees', 2, true),
  ('normal', 'milk_heat', '57 degrees', 3, true),
  ('normal', 'milk_heat', '58 degrees', 4, true),
  ('normal', 'milk_heat', '59 degrees', 5, true),
  ('normal', 'milk_heat', '60 degrees', 6, true),
  ('normal', 'milk_heat', '61 degrees', 7, true),
  ('normal', 'milk_heat', '62 degrees', 8, true),
  ('normal', 'milk_heat', '63 degrees', 9, true),
  ('normal', 'milk_heat', '64 degrees', 10, true),
  ('normal', 'milk_heat', '65 degrees', 11, true),
  ('normal', 'milk_heat', '66 degrees', 12, true),
  ('normal', 'milk_heat', '67 degrees', 13, true),
  ('normal', 'milk_heat', '68 degrees', 14, true),
  ('normal', 'milk_heat', '69 degrees', 15, true),
  ('normal', 'milk_heat', '70 degrees', 16, true),
  ('preacher', 'extra_item', 'Water', 1, true),
  ('preacher', 'extra_item', 'Juice', 2, true),
  ('preacher', 'extra_item', 'Tea', 3, true),
  ('preacher', 'extra_item', 'Extra coffee', 4, true),
  ('preacher', 'extra_item', 'Snacks', 5, true),
  ('preacher', 'extra_item', 'Napkins', 6, true)
on conflict (form_type, field_key, label) do nothing;

notify pgrst, 'reload schema';

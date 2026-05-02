alter table public.order_form_options
drop constraint if exists order_form_options_field_key_check;

alter table public.order_form_options
add constraint order_form_options_field_key_check
check (
  field_key in (
    'coffee_type',
    'milk_type',
    'sugar_type',
    'milk_heat',
    'extra_item',
    'eats_item',
    'eats_option',
    'sweet_chili_option'
  )
);

alter table public.coffee_orders
add column if not exists special_order_kind text check (special_order_kind in ('coffee_service', 'eats')),
add column if not exists eats_item text,
add column if not exists eats_option text,
add column if not exists sweet_chili_option text;

update public.coffee_orders
set special_order_kind = 'coffee_service'
where order_type = 'preacher'
  and special_order_kind is null;

insert into public.order_form_options (form_type, field_key, label, sort_order, active)
values
  ('preacher', 'eats_item', 'Tramazini', 1, true),
  ('preacher', 'eats_item', 'Toastie', 2, true),
  ('preacher', 'eats_option', 'Cheese Only', 1, true),
  ('preacher', 'eats_option', 'Ham and cheese', 2, true),
  ('preacher', 'eats_option', 'Ham and Feta Cheese', 3, true),
  ('preacher', 'sweet_chili_option', 'With Sweet Chili', 1, true),
  ('preacher', 'sweet_chili_option', 'Without Sweet Chili', 2, true)
on conflict (form_type, field_key, label) do nothing;

notify pgrst, 'reload schema';

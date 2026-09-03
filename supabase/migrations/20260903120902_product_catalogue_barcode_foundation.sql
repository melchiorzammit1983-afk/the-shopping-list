alter table public.items
  add column if not exists canonical_name text,
  add column if not exists brand text,
  add column if not exists variant text,
  add column if not exists package_quantity numeric,
  add column if not exists package_unit text,
  add column if not exists updated_at timestamptz,
  add column if not exists verification_status text,
  add column if not exists data_source text,
  add column if not exists created_by uuid references auth.users(id) on delete set null default auth.uid();

update public.items
set canonical_name = coalesce(nullif(btrim(canonical_name), ''), name),
    updated_at = coalesce(updated_at, created_at),
    verification_status = coalesce(verification_status, 'unverified'),
    data_source = coalesce(data_source, 'manual');

alter table public.items
  alter column canonical_name set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null,
  alter column verification_status set default 'unverified',
  alter column verification_status set not null,
  alter column data_source set default 'manual',
  alter column data_source set not null,
  add constraint items_name_not_blank check (btrim(name) <> ''),
  add constraint items_canonical_name_not_blank check (btrim(canonical_name) <> ''),
  add constraint items_package_quantity_positive check (package_quantity is null or package_quantity > 0),
  add constraint items_verification_status_check check (
    verification_status in ('unverified', 'user_verified', 'provider_verified')
  );

create index items_created_by_idx on public.items(created_by);
create index items_canonical_name_lower_idx on public.items(lower(canonical_name));
create index items_brand_lower_idx on public.items(lower(brand)) where brand is not null;

create table public.product_barcodes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.items(id) on delete cascade,
  barcode_value text not null unique,
  barcode_type text not null default 'other',
  created_at timestamptz not null default now(),
  constraint product_barcodes_value_not_blank check (btrim(barcode_value) <> ''),
  constraint product_barcodes_value_normalized check (
    barcode_value = upper(regexp_replace(barcode_value, '[^0-9A-Za-z]', '', 'g'))
  ),
  constraint product_barcodes_type_check check (
    barcode_type in ('ean_8', 'ean_13', 'upc_a', 'gtin_14', 'other')
  )
);

create index product_barcodes_product_id_idx on public.product_barcodes(product_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.items(id) on delete cascade,
  image_type text not null,
  storage_path text not null,
  image_url text not null,
  created_at timestamptz not null default now(),
  constraint product_images_type_check check (image_type in ('front', 'barcode')),
  constraint product_images_storage_path_not_blank check (btrim(storage_path) <> ''),
  constraint product_images_url_not_blank check (btrim(image_url) <> ''),
  constraint product_images_unique_asset unique (product_id, image_type, storage_path)
);

create index product_images_product_id_idx on public.product_images(product_id);

alter table public.product_barcodes enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Authenticated users can create items" on public.items;

create policy "Authenticated users can create owned items"
on public.items for insert to authenticated
with check (created_by = (select auth.uid()));

create policy "Creators can update items"
on public.items for update to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

create policy "Creators can delete items"
on public.items for delete to authenticated
using (created_by = (select auth.uid()));

create policy "Authenticated users can view product barcodes"
on public.product_barcodes for select to authenticated
using (true);

create policy "Creators can add product barcodes"
on public.product_barcodes for insert to authenticated
with check (exists (
  select 1 from public.items
  where items.id = product_barcodes.product_id
    and items.created_by = (select auth.uid())
));

create policy "Creators can update product barcodes"
on public.product_barcodes for update to authenticated
using (exists (
  select 1 from public.items
  where items.id = product_barcodes.product_id
    and items.created_by = (select auth.uid())
))
with check (exists (
  select 1 from public.items
  where items.id = product_barcodes.product_id
    and items.created_by = (select auth.uid())
));

create policy "Creators can delete product barcodes"
on public.product_barcodes for delete to authenticated
using (exists (
  select 1 from public.items
  where items.id = product_barcodes.product_id
    and items.created_by = (select auth.uid())
));

create policy "Authenticated users can view product images"
on public.product_images for select to authenticated
using (true);

create policy "Creators can add product images"
on public.product_images for insert to authenticated
with check (exists (
  select 1 from public.items
  where items.id = product_images.product_id
    and items.created_by = (select auth.uid())
));

create policy "Creators can update product images"
on public.product_images for update to authenticated
using (exists (
  select 1 from public.items
  where items.id = product_images.product_id
    and items.created_by = (select auth.uid())
))
with check (exists (
  select 1 from public.items
  where items.id = product_images.product_id
    and items.created_by = (select auth.uid())
));

create policy "Creators can delete product images"
on public.product_images for delete to authenticated
using (exists (
  select 1 from public.items
  where items.id = product_images.product_id
    and items.created_by = (select auth.uid())
));

create or replace function public.set_item_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_items_updated_at
before update on public.items
for each row execute function public.set_item_updated_at();

create or replace function public.create_product_with_barcode(
  product_name text,
  product_canonical_name text,
  product_brand text default null,
  product_variant text default null,
  product_category text default null,
  product_package_quantity numeric default null,
  product_package_unit text default null,
  product_barcode_value text default null,
  product_barcode_type text default null,
  front_image_path text default null,
  front_image_url text default null,
  barcode_image_path text default null,
  barcode_image_url text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_product_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if nullif(btrim(product_name), '') is null then
    raise exception 'Product name is required';
  end if;

  insert into public.items (
    name, canonical_name, brand, variant, category,
    package_quantity, package_unit, unit, verification_status,
    data_source, image_url, created_by
  ) values (
    btrim(product_name),
    coalesce(nullif(btrim(product_canonical_name), ''), btrim(product_name)),
    nullif(btrim(product_brand), ''),
    nullif(btrim(product_variant), ''),
    nullif(btrim(product_category), ''),
    product_package_quantity,
    nullif(btrim(product_package_unit), ''),
    nullif(btrim(product_package_unit), ''),
    'user_verified',
    'manual',
    nullif(btrim(front_image_url), ''),
    (select auth.uid())
  ) returning id into new_product_id;

  if nullif(btrim(product_barcode_value), '') is not null then
    insert into public.product_barcodes (product_id, barcode_value, barcode_type)
    values (
      new_product_id,
      upper(regexp_replace(product_barcode_value, '[^0-9A-Za-z]', '', 'g')),
      coalesce(nullif(product_barcode_type, ''), 'other')
    );
  end if;

  if nullif(btrim(front_image_path), '') is not null and nullif(btrim(front_image_url), '') is not null then
    insert into public.product_images (product_id, image_type, storage_path, image_url)
    values (new_product_id, 'front', btrim(front_image_path), btrim(front_image_url));
  end if;

  if nullif(btrim(barcode_image_path), '') is not null and nullif(btrim(barcode_image_url), '') is not null then
    insert into public.product_images (product_id, image_type, storage_path, image_url)
    values (new_product_id, 'barcode', btrim(barcode_image_path), btrim(barcode_image_url));
  end if;

  return new_product_id;
end;
$$;

revoke all on table public.product_barcodes from anon;
revoke all on table public.product_images from anon;
grant select, insert, update, delete on table public.product_barcodes to authenticated;
grant select, insert, update, delete on table public.product_images to authenticated;
grant all on table public.product_barcodes to service_role;
grant all on table public.product_images to service_role;

revoke all on function public.create_product_with_barcode(
  text, text, text, text, text, numeric, text, text, text, text, text, text, text
) from public, anon;
grant execute on function public.create_product_with_barcode(
  text, text, text, text, text, numeric, text, text, text, text, text, text, text
) to authenticated, service_role;

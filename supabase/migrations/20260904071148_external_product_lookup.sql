alter table public.product_images
  alter column storage_path drop not null;

create or replace function public.create_catalogue_product(
  product_name text,
  product_canonical_name text,
  product_brand text default null,
  product_variant text default null,
  product_category text default null,
  product_package_quantity numeric default null,
  product_package_unit text default null,
  product_barcode_value text default null,
  product_barcode_type text default null,
  product_data_source text default 'manual',
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
  existing_product_id uuid;
  normalized_barcode text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if nullif(btrim(product_name), '') is null then
    raise exception 'Product name is required';
  end if;
  normalized_barcode := nullif(
    upper(regexp_replace(product_barcode_value, '[^0-9A-Za-z]', '', 'g')),
    ''
  );

  begin
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
      coalesce(nullif(btrim(product_data_source), ''), 'manual'),
      nullif(btrim(front_image_url), ''),
      (select auth.uid())
    ) returning id into new_product_id;

    if normalized_barcode is not null then
      insert into public.product_barcodes (product_id, barcode_value, barcode_type)
      values (
        new_product_id,
        normalized_barcode,
        coalesce(nullif(product_barcode_type, ''), 'other')
      );
    end if;

    if nullif(btrim(front_image_url), '') is not null then
      insert into public.product_images (
        product_id, image_type, storage_path, image_url
      ) values (
        new_product_id,
        'front',
        nullif(btrim(front_image_path), ''),
        btrim(front_image_url)
      );
    end if;

    if nullif(btrim(barcode_image_url), '') is not null then
      insert into public.product_images (
        product_id, image_type, storage_path, image_url
      ) values (
        new_product_id,
        'barcode',
        nullif(btrim(barcode_image_path), ''),
        btrim(barcode_image_url)
      );
    end if;

    return new_product_id;
  exception
    when unique_violation then
      if normalized_barcode is null then
        raise;
      end if;

      select product_id into existing_product_id
      from public.product_barcodes
      where barcode_value = normalized_barcode;

      if existing_product_id is null then
        raise;
      end if;

      return existing_product_id;
  end;
end;
$$;

revoke all on function public.create_catalogue_product(
  text, text, text, text, text, numeric, text, text, text, text,
  text, text, text, text
) from public, anon;

grant execute on function public.create_catalogue_product(
  text, text, text, text, text, numeric, text, text, text, text,
  text, text, text, text
) to authenticated, service_role;

-- Praba Leather Bali — per-product SEO metadata.
-- Additive and idempotent. Run after schema.sql and admin.sql.
-- NULL keeps the product SEO fallback: product title and description.

alter table public.products add column if not exists meta_title varchar(255);
alter table public.products add column if not exists meta_description text;

comment on column public.products.meta_title is
  'Optional product page title rendered in the HTML metadata; NULL falls back to products.title.';
comment on column public.products.meta_description is
  'Optional product page description rendered in the HTML metadata; NULL falls back to products.description.';

-- Keep the existing admin save path atomic while accepting the two new fields.
create or replace function public.save_product_atomic(
  p_product_id uuid,
  p_product jsonb,
  p_variants jsonb,
  p_images jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if jsonb_typeof(p_product) <> 'object'
     or jsonb_typeof(coalesce(p_variants, '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_images, '[]'::jsonb)) <> 'array' then
    raise exception 'Invalid product payload' using errcode = '22023';
  end if;

  if p_product_id is null then
    insert into public.products (
      title, slug, description, meta_title, meta_description, leather_type,
      material_title, material_body, care_title, care_body,
      shipping_title, shipping_body, base_price_usd, is_featured, category_id
    )
    values (
      trim(coalesce(p_product ->> 'title', '')),
      trim(coalesce(p_product ->> 'slug', '')),
      trim(coalesce(p_product ->> 'description', '')),
      nullif(trim(p_product ->> 'meta_title'), ''),
      nullif(trim(p_product ->> 'meta_description'), ''),
      coalesce(nullif(trim(p_product ->> 'leather_type'), ''), 'Full-Grain Cowhide'),
      nullif(trim(p_product ->> 'material_title'), ''),
      nullif(trim(p_product ->> 'material_body'), ''),
      nullif(trim(p_product ->> 'care_title'), ''),
      nullif(trim(p_product ->> 'care_body'), ''),
      nullif(trim(p_product ->> 'shipping_title'), ''),
      nullif(trim(p_product ->> 'shipping_body'), ''),
      coalesce((p_product ->> 'base_price_usd')::numeric, 0),
      coalesce((p_product ->> 'is_featured')::boolean, false),
      nullif(p_product ->> 'category_id', '')::uuid
    )
    returning id into saved_id;
  else
    update public.products
    set title = trim(coalesce(p_product ->> 'title', '')),
        slug = trim(coalesce(p_product ->> 'slug', '')),
        description = trim(coalesce(p_product ->> 'description', '')),
        meta_title = nullif(trim(p_product ->> 'meta_title'), ''),
        meta_description = nullif(trim(p_product ->> 'meta_description'), ''),
        leather_type = coalesce(nullif(trim(p_product ->> 'leather_type'), ''), 'Full-Grain Cowhide'),
        material_title = nullif(trim(p_product ->> 'material_title'), ''),
        material_body = nullif(trim(p_product ->> 'material_body'), ''),
        care_title = nullif(trim(p_product ->> 'care_title'), ''),
        care_body = nullif(trim(p_product ->> 'care_body'), ''),
        shipping_title = nullif(trim(p_product ->> 'shipping_title'), ''),
        shipping_body = nullif(trim(p_product ->> 'shipping_body'), ''),
        base_price_usd = coalesce((p_product ->> 'base_price_usd')::numeric, 0),
        is_featured = coalesce((p_product ->> 'is_featured')::boolean, false),
        category_id = nullif(p_product ->> 'category_id', '')::uuid
    where id = p_product_id
    returning id into saved_id;

    if saved_id is null then
      raise exception 'Product % not found', p_product_id using errcode = 'P0002';
    end if;
  end if;

  delete from public.product_variants where product_id = saved_id;
  insert into public.product_variants (
    product_id, sku, color_name, color_hex, size_eu, description, image_url, stock_status
  )
  select saved_id, variant.sku, variant.color_name, variant.color_hex,
    variant.size_eu, variant.description, variant.image_url, variant.stock_status
  from jsonb_to_recordset(coalesce(p_variants, '[]'::jsonb)) as variant(
    sku varchar(100), color_name varchar(50), color_hex varchar(7), size_eu varchar(20),
    description text, image_url text, stock_status varchar(20)
  );

  delete from public.product_images where product_id = saved_id;
  insert into public.product_images (product_id, image_url, is_primary, display_order)
  select saved_id, image.image_url, image.is_primary, image.display_order
  from jsonb_to_recordset(coalesce(p_images, '[]'::jsonb)) as image(
    image_url text, is_primary boolean, display_order integer
  );

  return saved_id;
end;
$$;

revoke all on function public.save_product_atomic(uuid, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.save_product_atomic(uuid, jsonb, jsonb, jsonb) to authenticated;

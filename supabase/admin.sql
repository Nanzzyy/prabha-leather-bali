-- Praba Leather Bali — admin CMS layer.
-- Additive & idempotent. Run AFTER schema.sql + storage.sql in the Supabase SQL Editor.
--
-- Goal: let a signed-in ADMIN write catalog rows from the browser using only the
-- anon key, while everyone else (anon + non-admin authenticated) stays read-only.
-- service_role is NEVER used by the browser — it lives only in local scripts.
-- This is what guarantees "no data leakage": writes are gated by RLS, not by a
-- secret shipped to the client.

-- 1. profiles: one row per auth user, carrying the role.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on public.profiles from anon;
grant select on public.profiles to authenticated;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

-- 2. Profiles are provisioned explicitly by scripts/create-admin.mjs. Public
-- Auth sign-ups, if accidentally enabled, must not create a CMS role row.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 3. is_admin(): true when the current session's user has role = 'admin'.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 4. Restore writes to authenticated. schema.sql revoked these; now safe because
--    every write row is gated to admin by the policies below.
revoke insert, update, delete on public.categories, public.products, public.product_images, public.product_variants from anon;
grant insert, update, delete on public.categories, public.products, public.product_images, public.product_variants to authenticated;

-- 5. Admin-gated write policies. (Public SELECT policies from schema.sql remain in
--    effect, so reads stay open to anon + authenticated — catalog is public content.)
drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images" on public.product_images
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage product variants" on public.product_variants;
create policy "Admins manage product variants" on public.product_variants
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 6. Storage: admins can upload/replace/delete product images. Public read stays.
drop policy if exists "Admins manage product-image objects" on storage.objects;
create policy "Admins manage product-image objects" on storage.objects
  for all to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- 7. Save a product and replace its variants/images as one transaction. The
-- function is SECURITY INVOKER, so every statement remains subject to RLS.
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
      title, slug, description, leather_type,
      material_title, material_body, care_title, care_body,
      shipping_title, shipping_body, base_price_usd, is_featured, category_id
    )
    values (
      trim(coalesce(p_product ->> 'title', '')),
      trim(coalesce(p_product ->> 'slug', '')),
      trim(coalesce(p_product ->> 'description', '')),
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

-- Praba Leather Bali catalog schema.
-- Run in the Supabase SQL Editor or through the Supabase CLI.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  slug varchar(100) unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title varchar(255) not null,
  slug varchar(255) unique not null,
  description text,
  leather_type varchar(100) not null default 'Full-Grain Cowhide',
  material_title text,
  material_body text,
  care_title text,
  care_body text,
  shipping_title text,
  shipping_body text,
  base_price_usd numeric(10, 2) not null check (base_price_usd >= 0),
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Additive compatibility for projects created from an earlier schema version.
alter table public.products add column if not exists material_title text;
alter table public.products add column if not exists material_body text;
alter table public.products add column if not exists care_title text;
alter table public.products add column if not exists care_body text;
alter table public.products add column if not exists shipping_title text;
alter table public.products add column if not exists shipping_body text;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  display_order int not null default 0 check (display_order >= 0)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku varchar(100) unique not null,
  color_name varchar(50) not null,
  color_hex varchar(10),
  size_eu varchar(10),
  stock_status varchar(20) not null default 'available' check (stock_status in ('available', 'preorder', 'out_of_stock'))
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(is_featured) where is_featured = true;
create index if not exists product_images_product_id_idx on public.product_images(product_id, display_order);
create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists product_variants_stock_status_idx on public.product_variants(stock_status);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories for select to anon, authenticated using (true);

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products" on public.products for select to anon, authenticated using (true);

drop policy if exists "Public can read product images" on public.product_images;
create policy "Public can read product images" on public.product_images for select to anon, authenticated using (true);

drop policy if exists "Public can read product variants" on public.product_variants;
create policy "Public can read product variants" on public.product_variants for select to anon, authenticated using (true);

-- Catalog content is read-only from the storefront. Keep writes in the dashboard/service role.
revoke insert, update, delete on public.categories, public.products, public.product_images, public.product_variants from anon, authenticated;

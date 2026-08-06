-- Praba Leather Bali — CMS content tables (Phase 2).
-- Additive & idempotent. Run AFTER schema.sql + admin.sql in the Supabase SQL Editor.
-- Covers: all editable storefront copy/images, homepage hero carousel, Curated Looks
-- (Lookbook) + hotspots, and Contact stores.
-- Reuses the is_admin() function + product-images storage bucket from earlier scripts.

-- 1. Hero carousel images -------------------------------------------------
create table if not exists public.hero_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text not null default 'Editorial view of handcrafted leather',
  caption text not null default '',
  display_order int not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists hero_images_order_idx on public.hero_images(display_order);
alter table public.hero_images add column if not exists alt_text text not null default 'Editorial view of handcrafted leather';
alter table public.hero_images add column if not exists caption text not null default '';

-- 2. Curated Looks + hotspots --------------------------------------------
create table if not exists public.looks (
  id uuid primary key default gen_random_uuid(),
  title varchar(120) not null,
  image_url text not null,
  image_url_2 text,
  display_order int not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists looks_order_idx on public.looks(display_order);

create table if not exists public.look_spots (
  id uuid primary key default gen_random_uuid(),
  look_id uuid not null references public.looks(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  image_index smallint not null default 0 check (image_index in (0, 1)),
  x numeric(5,2) not null default 50 check (x between 0 and 100),
  y numeric(5,2) not null default 50 check (y between 0 and 100),
  display_order int not null default 0
);
create index if not exists look_spots_look_idx on public.look_spots(look_id, display_order);

-- Additive migration for projects that already ran an earlier CMS version.
alter table public.looks add column if not exists image_url_2 text;
alter table public.look_spots add column if not exists image_index smallint not null default 0;
alter table public.look_spots drop constraint if exists look_spots_image_index_check;
alter table public.look_spots add constraint look_spots_image_index_check check (image_index in (0, 1));

-- 2b. Editable website content -------------------------------------------
-- One JSON document per page and locale keeps the editor flexible without
-- scattering dozens of CMS columns across the schema.
create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  locale varchar(5) not null check (locale in ('en', 'id')),
  section varchar(30) not null check (section in ('global', 'home', 'collection', 'catalog', 'contact', 'about')),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (locale, section)
);
create index if not exists site_content_locale_idx on public.site_content(locale, section);

create or replace function public.set_site_content_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at
before update on public.site_content
for each row execute function public.set_site_content_updated_at();

-- 3. Contact stores -------------------------------------------------------
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  address text not null default '',
  phone varchar(60) not null default '',
  phone_href varchar(60) not null default '',
  email varchar(120) not null default '',
  hours text not null default '',
  map_query text not null default '',
  display_order int not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists stores_order_idx on public.stores(display_order);

-- 4. RLS: public read, admin write ---------------------------------------
alter table public.hero_images enable row level security;
alter table public.looks enable row level security;
alter table public.look_spots enable row level security;
alter table public.stores enable row level security;
alter table public.site_content enable row level security;

drop policy if exists "Public can read hero images" on public.hero_images;
create policy "Public can read hero images" on public.hero_images for select to anon, authenticated using (true);

drop policy if exists "Public can read looks" on public.looks;
create policy "Public can read looks" on public.looks for select to anon, authenticated using (true);

drop policy if exists "Public can read look spots" on public.look_spots;
create policy "Public can read look spots" on public.look_spots for select to anon, authenticated using (true);

drop policy if exists "Public can read stores" on public.stores;
create policy "Public can read stores" on public.stores for select to anon, authenticated using (true);

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content" on public.site_content for select to anon, authenticated using (true);

grant insert, update, delete on public.hero_images, public.looks, public.look_spots, public.stores, public.site_content to authenticated;

drop policy if exists "Admins manage hero images" on public.hero_images;
create policy "Admins manage hero images" on public.hero_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage looks" on public.looks;
create policy "Admins manage looks" on public.looks for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage look spots" on public.look_spots;
create policy "Admins manage look spots" on public.look_spots for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage stores" on public.stores;
create policy "Admins manage stores" on public.stores for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage site content" on public.site_content;
create policy "Admins manage site content" on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 5. Seed the three existing ateliers so the Contact CMS opens with content.
insert into public.stores (name, address, phone, phone_href, email, hours, map_query, display_order, is_active)
values
  ('Praba Atelier · Canggu', 'Jl. Nelayan, Canggu, Kec. Kuta Utara, Kabupaten Badung, Bali', '+62 818 0459 5666', '+6281804595666', 'hello@prabaleather.com', 'Mon–Sat · 09:00–19:00', 'Jl. Nelayan, Canggu, Bali', 0, true),
  ('Praba Boutique · Ubud', 'Jl. Monkey Forest, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571', '+62 818 0459 5666', '+6281804595666', 'hello@prabaleather.com', 'Mon–Sun · 10:00–20:00', 'Jl. Monkey Forest, Ubud, Bali', 1, true),
  ('Praba Studio · Seminyak', 'Jl. Raya Seminyak, Kec. Kuta, Kabupaten Badung, Bali', '+62 818 0459 5666', '+6281804595666', 'hello@prabaleather.com', 'Mon–Sat · 10:00–19:00', 'Jl. Raya Seminyak, Bali', 2, true)
on conflict do nothing;

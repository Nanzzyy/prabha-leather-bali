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

-- 2. Auto-create a profile (as 'editor') whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role) values (new.id, new.email, 'editor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 3. is_admin(): true when the current session's user has role = 'admin'.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

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

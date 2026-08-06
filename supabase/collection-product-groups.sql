-- Praba Leather Bali — Collection subcategory product assignments.
-- Additive and idempotent. Run after schema.sql and admin.sql.
--
-- Category and subcategory labels remain editorial content in site_content.
-- This table only links existing catalog products to a stable, slugified
-- subcategory key so products are never duplicated or re-entered manually.

create table if not exists public.collection_product_groups (
  category_id uuid not null references public.categories(id) on delete cascade,
  subcategory_slug varchar(100) not null,
  product_id uuid not null references public.products(id) on delete cascade,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  primary key (category_id, subcategory_slug, product_id),
  constraint collection_product_groups_slug_check
    check (subcategory_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- The primary key covers category + subcategory reads. This reverse index
-- keeps product deletes and product-centric audits efficient.
create index if not exists collection_product_groups_product_idx
  on public.collection_product_groups(product_id);

alter table public.collection_product_groups enable row level security;

drop policy if exists "Public can read collection product groups" on public.collection_product_groups;
create policy "Public can read collection product groups"
  on public.collection_product_groups for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins insert collection product groups" on public.collection_product_groups;
create policy "Admins insert collection product groups"
  on public.collection_product_groups for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins delete collection product groups" on public.collection_product_groups;
create policy "Admins delete collection product groups"
  on public.collection_product_groups for delete
  to authenticated
  using (public.is_admin());

-- Explicit Data API grants are required by newer Supabase projects.
grant select on public.collection_product_groups to anon, authenticated;
grant insert, delete on public.collection_product_groups to authenticated;

-- Atomic replacement prevents a failed save from leaving a subcategory half-filled.
create or replace function public.replace_collection_product_group(
  p_category_id uuid,
  p_subcategory_slug text,
  p_product_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  valid_count integer;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_subcategory_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Invalid subcategory slug' using errcode = '22023';
  end if;

  select count(*) into valid_count
  from public.products
  where category_id = p_category_id
    and id = any(coalesce(p_product_ids, array[]::uuid[]));

  if valid_count <> cardinality(coalesce(p_product_ids, array[]::uuid[])) then
    raise exception 'Every selected product must belong to the selected category' using errcode = '23514';
  end if;

  delete from public.collection_product_groups
  where category_id = p_category_id
    and subcategory_slug = p_subcategory_slug;

  insert into public.collection_product_groups(category_id, subcategory_slug, product_id, display_order)
  select p_category_id, p_subcategory_slug, product_id, ordinality - 1
  from unnest(coalesce(p_product_ids, array[]::uuid[])) with ordinality as selected(product_id, ordinality);
end;
$$;

revoke all on function public.replace_collection_product_group(uuid, text, uuid[]) from public, anon;
grant execute on function public.replace_collection_product_group(uuid, text, uuid[]) to authenticated;

-- Sensible first assignments for the catalog seed. Admin can change all of these.
insert into public.collection_product_groups(category_id, subcategory_slug, product_id, display_order)
select c.id, seed.subcategory_slug, p.id, seed.display_order
from (values
  ('bags', 'totes', 'ubud-weave-tote', 0),
  ('bags', 'everyday-bags', 'ubud-weave-tote', 0),
  ('bags', 'briefcases', 'heritage-briefcase', 0),
  ('bags', 'everyday-bags', 'heritage-briefcase', 1),
  ('bags', 'everyday-bags', 'praba-sample-piece', 2),
  ('boots', 'heritage-boots', 'the-duke-heritage-boot', 0),
  ('boots', 'everyday-boots', 'the-duke-heritage-boot', 0),
  ('boots', 'lace-up-boots', 'the-duke-heritage-boot', 0),
  ('wallets', 'cardholders', 'artisan-cardholder-set', 0),
  ('accessories', 'belts', 'classic-dress-belt', 0),
  ('jackets', 'moto-jackets', 'onyx-moto-jacket', 0),
  ('jackets', 'outerwear', 'onyx-moto-jacket', 0)
) as seed(category_slug, subcategory_slug, product_slug, display_order)
join public.categories c on c.slug = seed.category_slug
join public.products p on p.slug = seed.product_slug and p.category_id = c.id
on conflict (category_id, subcategory_slug, product_id) do nothing;

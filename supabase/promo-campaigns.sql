-- Praba Leather Bali — configurable promotional campaigns.
-- Run after schema.sql, admin.sql, and the other catalog scripts.

create table if not exists public.promo_campaigns (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  slug varchar(150) unique not null,
  description text not null default '',
  is_active boolean not null default false,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.promo_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.promo_campaigns(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  promo_price_usd numeric(10, 2) not null check (promo_price_usd >= 0),
  display_order integer not null default 0 check (display_order >= 0),
  unique (campaign_id, product_id)
);

create table if not exists public.promo_settings (
  id boolean primary key default true check (id = true),
  is_enabled boolean not null default false,
  nav_campaign_id uuid references public.promo_campaigns(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.promo_settings (id, is_enabled)
values (true, false)
on conflict (id) do nothing;

create index if not exists promo_campaigns_active_order_idx
  on public.promo_campaigns(is_active, display_order, created_at desc);
create index if not exists promo_items_campaign_order_idx
  on public.promo_items(campaign_id, display_order);
create index if not exists promo_items_product_idx
  on public.promo_items(product_id);

alter table public.promo_campaigns enable row level security;
alter table public.promo_items enable row level security;
alter table public.promo_settings enable row level security;

revoke all on table public.promo_campaigns, public.promo_items, public.promo_settings from anon, authenticated;
grant select on table public.promo_campaigns, public.promo_items, public.promo_settings to anon, authenticated;
grant insert, update, delete on table public.promo_campaigns, public.promo_items, public.promo_settings to authenticated;

drop policy if exists "Public can read active promo campaigns" on public.promo_campaigns;
create policy "Public can read active promo campaigns"
  on public.promo_campaigns for select to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read active promo items" on public.promo_items;
create policy "Public can read active promo items"
  on public.promo_items for select to anon, authenticated
  using (exists (
    select 1 from public.promo_campaigns campaign
    where campaign.id = promo_items.campaign_id and campaign.is_active = true
  ));

drop policy if exists "Admins manage promo campaigns" on public.promo_campaigns;
create policy "Admins manage promo campaigns"
  on public.promo_campaigns for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage promo items" on public.promo_items;
create policy "Admins manage promo items"
  on public.promo_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read enabled promo settings" on public.promo_settings;
create policy "Public can read enabled promo settings"
  on public.promo_settings for select to anon, authenticated
  using (is_enabled = true);

drop policy if exists "Admins manage promo settings" on public.promo_settings;
create policy "Admins manage promo settings"
  on public.promo_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Save a campaign and replace its product/price assignments in one transaction.
-- SECURITY INVOKER keeps this function subject to the table RLS policies.
create or replace function public.save_promo_campaign_atomic(
  p_campaign_id uuid,
  p_campaign jsonb,
  p_items jsonb
)
returns uuid language plpgsql set search_path = public
as $$
declare
  v_campaign_id uuid;
  v_name text;
  v_slug text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can save promotional campaigns' using errcode = '42501';
  end if;
  if jsonb_typeof(p_campaign) <> 'object' or jsonb_typeof(coalesce(p_items, '[]'::jsonb)) <> 'array' then
    raise exception 'Invalid promotional campaign payload' using errcode = '22023';
  end if;

  v_name := trim(coalesce(p_campaign ->> 'name', ''));
  v_slug := trim(coalesce(p_campaign ->> 'slug', ''));
  if v_name = '' or v_slug = '' then
    raise exception 'Campaign name and slug are required' using errcode = '22023';
  end if;
  if v_slug in ('about', 'admin', 'api', 'catalog', 'collection', 'contact', 'cookies', 'maintenance', 'privacy', 'promo', 'terms') then
    raise exception 'Campaign slug is reserved by the storefront' using errcode = '22023';
  end if;

  if p_campaign_id is null then
    insert into public.promo_campaigns (name, slug, description, is_active, display_order)
    values (v_name, v_slug, trim(coalesce(p_campaign ->> 'description', '')),
      coalesce((p_campaign ->> 'is_active')::boolean, false),
      greatest(coalesce((p_campaign ->> 'display_order')::integer, 0), 0))
    returning id into v_campaign_id;
  else
    update public.promo_campaigns
    set name = v_name, slug = v_slug,
        description = trim(coalesce(p_campaign ->> 'description', '')),
        is_active = coalesce((p_campaign ->> 'is_active')::boolean, false),
        display_order = greatest(coalesce((p_campaign ->> 'display_order')::integer, 0), 0)
    where id = p_campaign_id returning id into v_campaign_id;
    if v_campaign_id is null then
      raise exception 'Promotional campaign not found' using errcode = 'P0002';
    end if;
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as item(product_id uuid, promo_price_usd numeric, display_order integer)
    join public.products product on product.id = item.product_id
    where item.promo_price_usd is null or item.promo_price_usd < 0
       or item.promo_price_usd > product.base_price_usd
  ) then
    raise exception 'Promo price must be between zero and the normal product price' using errcode = '22023';
  end if;

  delete from public.promo_items where campaign_id = v_campaign_id;
  insert into public.promo_items (campaign_id, product_id, promo_price_usd, display_order)
  select v_campaign_id, item.product_id, item.promo_price_usd,
    greatest(coalesce(item.display_order, 0), 0)
  from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as item(product_id uuid, promo_price_usd numeric, display_order integer);
  return v_campaign_id;
end;
$$;

revoke all on function public.save_promo_campaign_atomic(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.save_promo_campaign_atomic(uuid, jsonb, jsonb) to authenticated;

create or replace function public.save_promo_settings(
  p_is_enabled boolean,
  p_nav_campaign_id uuid
)
returns void language plpgsql set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can save promotional menu settings' using errcode = '42501';
  end if;
  if p_is_enabled and p_nav_campaign_id is null then
    raise exception 'Choose an active campaign before enabling the promotional menu' using errcode = '22023';
  end if;
  if p_nav_campaign_id is not null and not exists (
    select 1 from public.promo_campaigns
    where id = p_nav_campaign_id and is_active = true
  ) then
    raise exception 'The selected campaign must be active' using errcode = '22023';
  end if;

  insert into public.promo_settings (id, is_enabled, nav_campaign_id, updated_at)
  values (true, p_is_enabled, p_nav_campaign_id, now())
  on conflict (id) do update
    set is_enabled = excluded.is_enabled,
        nav_campaign_id = excluded.nav_campaign_id,
        updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.save_promo_settings(boolean, uuid) from public, anon;
grant execute on function public.save_promo_settings(boolean, uuid) to authenticated;

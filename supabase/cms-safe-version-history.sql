-- Praba Leather Bali — CMS safe-version history (multi-snapshot).
-- Additive and idempotent. Run after cms-content.sql and admin.sql.
--
-- Replaces the single-snapshot model: every "save safe version" inserts a new
-- labelled row, so admins keep a history and can restore any past version.
-- Content is stored as a full site-content jsonb per locale (text + image URLs);
-- restoring overwrites all 6 sections for that locale.

create table if not exists public.site_content_snapshots (
  id uuid primary key default gen_random_uuid(),
  locale varchar(5) not null check (locale in ('en', 'id')),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  label text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists site_content_snapshots_locale_idx
  on public.site_content_snapshots(locale, created_at desc);

alter table public.site_content_snapshots enable row level security;

drop policy if exists "Admins manage site content snapshots" on public.site_content_snapshots;
create policy "Admins manage site content snapshots"
  on public.site_content_snapshots for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Snapshots are private: storefront visitors never need them.
grant select, insert, update, delete on public.site_content_snapshots to authenticated;
revoke all on public.site_content_snapshots from anon;

-- Best-effort import when upgrading from the older single-snapshot model.
do $$
begin
  if to_regclass('public.site_content_safe_versions') is not null then
    execute $migration$
      insert into public.site_content_snapshots(locale, content, label, created_at)
      select legacy.locale, legacy.content, 'Imported safe version', legacy.updated_at
      from public.site_content_safe_versions legacy
      where not exists (
        select 1 from public.site_content_snapshots snapshot
        where snapshot.locale = legacy.locale
          and snapshot.content = legacy.content
          and snapshot.created_at = legacy.updated_at
      )
    $migration$;
  end if;
end;
$$;

-- Restore one snapshot by id into the live site_content (all 6 sections for its
-- locale). Admin-only.
create or replace function public.restore_site_content_snapshot(p_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  snap record;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select locale, content into snap
  from public.site_content_snapshots
  where id = p_id;

  if snap is null then
    raise exception 'Snapshot % not found', p_id using errcode = 'P0002';
  end if;

  insert into public.site_content(locale, section, content)
  select snap.locale, section.key, section.value
  from jsonb_each(snap.content) as section
  where section.key in ('global', 'home', 'collection', 'catalog', 'contact', 'about')
  on conflict (locale, section) do update
  set content = excluded.content;
end;
$$;

revoke all on function public.restore_site_content_snapshot(uuid) from public, anon;
grant execute on function public.restore_site_content_snapshot(uuid) to authenticated;

-- The multi-snapshot model is now the only supported model.
drop function if exists public.restore_site_content_safe_version(varchar);
drop function if exists public.restore_site_content_safe_version(text);
drop table if exists public.site_content_safe_versions;

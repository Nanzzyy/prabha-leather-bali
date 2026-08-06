-- Praba Leather Bali — CMS safe/global version snapshots.
-- Additive and idempotent. Run after cms-content.sql and admin.sql.

create table if not exists public.site_content_safe_versions (
  locale varchar(5) primary key check (locale in ('en', 'id')),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.site_content_safe_versions enable row level security;

drop policy if exists "Admins manage site content safe versions" on public.site_content_safe_versions;
create policy "Admins manage site content safe versions"
  on public.site_content_safe_versions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Safe versions are intentionally private: storefront visitors never need them.
grant select, insert, update, delete on public.site_content_safe_versions to authenticated;
revoke all on public.site_content_safe_versions from anon;

create or replace function public.restore_site_content_safe_version(p_locale text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  snapshot jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_locale not in ('en', 'id') then
    raise exception 'Invalid locale' using errcode = '22023';
  end if;

  select content into snapshot
  from public.site_content_safe_versions
  where locale = p_locale;

  if snapshot is null then
    raise exception 'No safe version exists for locale %', p_locale using errcode = 'P0002';
  end if;

  insert into public.site_content(locale, section, content)
  select p_locale, section.key, section.value
  from jsonb_each(snapshot) as section
  where section.key in ('global', 'home', 'collection', 'catalog', 'contact', 'about')
  on conflict (locale, section) do update
  set content = excluded.content;
end;
$$;

revoke all on function public.restore_site_content_safe_version(text) from public, anon;
grant execute on function public.restore_site_content_safe_version(text) to authenticated;

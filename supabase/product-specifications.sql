-- Praba Leather Bali — per-product detail panels.
-- Additive and idempotent. Run after schema.sql on an existing project.
-- NULL means the storefront uses the locale's global Catalog defaults.

alter table public.products add column if not exists material_title text;
alter table public.products add column if not exists material_body text;
alter table public.products add column if not exists care_title text;
alter table public.products add column if not exists care_body text;
alter table public.products add column if not exists shipping_title text;
alter table public.products add column if not exists shipping_body text;

comment on column public.products.material_title is 'Optional per-product override; NULL uses global catalog material title.';
comment on column public.products.material_body is 'Optional per-product override; NULL uses global catalog material body.';
comment on column public.products.care_title is 'Optional per-product override; NULL uses global catalog care title.';
comment on column public.products.care_body is 'Optional per-product override; NULL uses global catalog care body.';
comment on column public.products.shipping_title is 'Optional per-product override; NULL uses global catalog shipping title.';
comment on column public.products.shipping_body is 'Optional per-product override; NULL uses global catalog shipping body.';

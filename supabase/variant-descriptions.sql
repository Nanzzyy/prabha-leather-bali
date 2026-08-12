-- Praba Leather Bali — per-variant descriptions.
-- Additive and idempotent. Run after schema.sql + admin.sql.
-- NULL keeps the variant description hidden while the product description remains visible.

alter table public.product_variants
  add column if not exists description text;

comment on column public.product_variants.description is
  'Optional copy shown when this color/size variant is selected on the product detail page.';

-- Existing product_variants RLS and admin write policies cover this new column.

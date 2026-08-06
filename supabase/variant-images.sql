-- Praba Leather Bali — per-variant product image.
-- Additive and idempotent. Run after schema.sql + admin.sql.
--
-- Lets a variant (color) point at one of the product's gallery images so the
-- detail page can swap the main image when a color is chosen — no extra upload,
-- just a reference to an existing product_images URL.

alter table public.product_variants
  add column if not exists image_url text;

comment on column public.product_variants.image_url is
  'Optional gallery image URL shown when this variant (color) is selected.';

-- Admins write it (schema.sql grants variants to authenticated already; admin.sql
-- re-gates writes to is_admin()). No extra policy needed — the existing
-- "Admins manage product variants" policy covers the new column.

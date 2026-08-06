insert into public.categories (name, slug) values
  ('Boots', 'boots'), ('Bags', 'bags'), ('Wallets', 'wallets'), ('Accessories', 'accessories'), ('Jackets', 'jackets')
on conflict (slug) do update set name = excluded.name;

insert into public.products (category_id, title, slug, description, leather_type, base_price_usd, is_featured)
select c.id, p.title, p.slug, p.description, p.leather_type, p.base_price_usd, p.is_featured
from (values
  ('boots', 'The Duke Heritage Boot', 'the-duke-heritage-boot', 'A timeless Goodyear-welted boot handcrafted in Bali for a lifetime of wear and patina.', 'Full-Grain Cowhide', 140.00, true),
  ('bags', 'Ubud Weave Tote', 'ubud-weave-tote', 'A spacious everyday tote with hand-finished leather and a quiet, structured silhouette.', 'Vegetable-Tanned Leather', 280.00, true),
  ('jackets', 'The Onyx Moto Jacket', 'onyx-moto-jacket', 'Clean architectural lines meet supple full-grain leather in this modern wardrobe heirloom.', 'Premium Full-Grain Leather', 420.00, true),
  ('accessories', 'Classic Dress Belt', 'classic-dress-belt', 'A refined belt with a solid brass buckle, burnished edges, and a rich grain that improves with age.', 'Full-Grain Cowhide', 65.00, false),
  ('bags', 'Heritage Briefcase', 'heritage-briefcase', 'A dependable carry-all shaped by hand with generous compartments and antique brass hardware.', 'Crazy Horse Leather', 360.00, false),
  ('wallets', 'Artisan Cardholder Set', 'artisan-cardholder-set', 'A compact cardholder set that puts natural grain, hand stitching, and daily utility first.', 'Vegetable-Tanned Leather', 45.00, false)
) as p(category_slug, title, slug, description, leather_type, base_price_usd, is_featured)
join public.categories c on c.slug = p.category_slug
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  leather_type = excluded.leather_type,
  base_price_usd = excluded.base_price_usd,
  is_featured = excluded.is_featured;

-- Praba sample piece (hover-swap demo). Local images live in /public/samples.
with sample as (
  insert into public.products (category_id, title, slug, description, leather_type, base_price_usd, is_featured)
  select c.id, 'Praba Sample Piece', 'praba-sample-piece',
         'Sample piece - hover the card to swap the image. Handcrafted in Bali.',
         'Full-Grain Cowhide', 220.00, true
  from public.categories c where c.slug = 'bags'
  on conflict (slug) do update set
    title = excluded.title, description = excluded.description,
    base_price_usd = excluded.base_price_usd, is_featured = excluded.is_featured
  returning id
),
pid as (select id from sample),
clean as (
  delete from public.product_images where product_id in (select id from pid)
),
clean_v as (
  delete from public.product_variants where product_id in (select id from pid)
)
insert into public.product_images (product_id, image_url, is_primary, display_order)
select id, img, (ord = 0), ord
from pid, (values ('/samples/sample-main.jpeg', 0), ('/samples/sample-hover.jpeg', 1)) as v(img, ord);

insert into public.product_variants (product_id, sku, color_name, color_hex, stock_status)
select id, 'PSP-TAN', 'Saddle Tan', '#8B4513', 'available'
from public.products where slug = 'praba-sample-piece'
on conflict (sku) do update set color_name = excluded.color_name, color_hex = excluded.color_hex;

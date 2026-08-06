// Seed the catalog with real, licensed images (Unsplash — free for commercial use,
// no attribution required). Idempotent: upserts by slug, replaces variants + images.
//
// Uses SUPABASE_SERVICE_ROLE_KEY (local only — bypasses RLS). This is the same data
// path the admin UI writes to; it's a seed convenience, not a bypass the storefront
// ships. Run AFTER schema.sql + admin.sql + cms-content.sql are applied.
//
//   node scripts/seed-catalog.mjs
//
// To revert a product, delete it from /admin/products/ — this script never deletes.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';

function load(p) {
  if (!existsSync(p)) return {};
  const o = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith('#')) o[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return o;
}
const env = { ...load('.env'), ...load('.env.local') };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const svc = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !svc || !svc.startsWith('eyJ')) {
  console.error('Missing real SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Add it to .env.local from Supabase Dashboard → Project Settings → API → service_role, then re-run.');
  process.exit(1);
}

const sb = createClient(url, svc, { auth: { autoRefreshToken: false, persistSession: false } });
const IMG = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Verify an image URL actually resolves before inserting it — never seed dead links.
async function live(imageUrl) {
  try {
    const r = await fetch(imageUrl, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
    return r.ok;
  } catch { return false; }
}

const PRODUCTS = [
  { slug: 'the-duke-heritage-boot', title: 'The Duke Heritage Boot', category: 'boots', leather: 'Full-Grain Cowhide', price: 240, featured: true,
    desc: 'A Goodyear-welted boot handcrafted in Bali for a lifetime of wear and a patina that deepens with every step.',
    images: ['1605733160314-4fc7dac4bb16', '1605812860427-4024433a70fd'],
    variants: [['DHB-TAN-41', 'Saddle Tan', '#8B4513', '41'], ['DHB-TAN-42', 'Saddle Tan', '#8B4513', '42'], ['DHB-ONYX-42', 'Onyx Black', '#181311', '42']] },
  { slug: 'rider-lace-up-boot', title: 'Rider Lace-Up Boot', category: 'boots', leather: 'Vegetable-Tanned Leather', price: 195, featured: false,
    desc: 'A pared-back lace-up with a soft vegetable-tanned upper and a hard-wearing sole, built for daily roads.',
    images: ['1608256246200-53e635b5b65f', '1550998358-08b4f83dc345'],
    variants: [['RLB-BRN-43', 'Vintage Brown', '#5C4033', '43'], ['RLB-BRN-44', 'Vintage Brown', '#5C4033', '44']] },
  { slug: 'ubud-weave-tote', title: 'Ubud Weave Tote', category: 'bags', leather: 'Vegetable-Tanned Leather', price: 280, featured: true,
    desc: 'A spacious everyday tote with hand-finished leather and a quiet, structured silhouette.',
    images: ['1598532163257-ae3c6b2524b6', '1605733513597-a8f8341084e6'],
    variants: [['UWT-TAN', 'Saddle Tan', '#8B4513', null], ['UWT-ONYX', 'Onyx Black', '#181311', null]] },
  { slug: 'canggu-crossbody-bag', title: 'Canggu Crossbody Bag', category: 'bags', leather: 'Full-Grain Cowhide', price: 165, featured: false,
    desc: 'A compact crossbody that keeps the essentials close, with an adjustable strap and a soft broken-in feel.',
    images: ['1600857062241-98e5dba7f214', '1608731267464-c0c889c2ff92'],
    variants: [['CCB-TAN', 'Saddle Tan', '#8B4513', null], ['CCB-BRN', 'Dark Brown', '#5C4033', null]] },
  { slug: 'voyager-messenger-bag', title: 'Voyager Messenger Bag', category: 'bags', leather: 'Crazy Horse Leather', price: 320, featured: true,
    desc: 'A dependable messenger shaped by hand with a padded sleeve and antique brass hardware for the daily commute.',
    images: ['1473188588951-666fce8e7c68', '1603219527847-24c87f552a77'],
    variants: [['VMB-BRN', 'Dark Brown', '#5C4033', null], ['VMB-ONYX', 'Onyx Black', '#181311', null]] },
  { slug: 'heritage-briefcase', title: 'Heritage Briefcase', category: 'bags', leather: 'Crazy Horse Leather', price: 360, featured: false,
    desc: 'A carry-all briefcase with generous compartments, a structured base, and hardware that ages gracefully.',
    images: ['1691480150204-66dd1eb77391', '1473188588951-666fce8e7c68'],
    variants: [['HB-BRN', 'Dark Brown', '#5C4033', null]] },
  { slug: 'artisan-cardholder-set', title: 'Artisan Cardholder Set', category: 'wallets', leather: 'Vegetable-Tanned Leather', price: 45, featured: false,
    desc: 'A compact cardholder set that puts natural grain, hand stitching, and daily utility first.',
    images: ['1614330316567-11d8e572db16', '1601592996763-f05c9c80a7f1'],
    variants: [['ACS-TAN', 'Light Tan', '#D2B48C', null]] },
  { slug: 'slim-bifold-wallet', title: 'Slim Bifold Wallet', category: 'wallets', leather: 'Full-Grain Cowhide', price: 85, featured: true,
    desc: 'A slim bifold with edge-painted card slots and a note pocket — full-grain leather that softens with use.',
    images: ['1601592996763-f05c9c80a7f1', '1614330316567-11d8e572db16'],
    variants: [['SBW-ONYX', 'Onyx Black', '#181311', null], ['SBW-BRN', 'Vintage Brown', '#5C4033', null]] },
  { slug: 'onyx-moto-jacket', title: 'The Onyx Moto Jacket', category: 'jackets', leather: 'Premium Full-Grain Leather', price: 420, featured: true,
    desc: 'Clean architectural lines meet supple full-grain leather in this modern wardrobe heirloom.',
    images: ['1551028719-00167b16eac5', '1727515546577-f7d82a47b51d'],
    variants: [['OMJ-ONYX-M', 'Deep Onyx', '#181311', 'M'], ['OMJ-ONYX-L', 'Deep Onyx', '#181311', 'L']] },
  { slug: 'seminyak-bomber-jacket', title: 'Seminyak Bomber Jacket', category: 'jackets', leather: 'Full-Grain Cowhide', price: 380, featured: false,
    desc: 'A relaxed bomber cut from warm full-grain cowhide, with a smooth two-way zip and ribbed cuffs.',
    images: ['1623854156816-4c4fc355ffc7', '1521223890158-f9f7c3d5d504'],
    variants: [['SBJ-BRN-M', 'Vintage Brown', '#5C4033', 'M'], ['SBJ-BRN-L', 'Vintage Brown', '#5C4033', 'L']] },
  { slug: 'classic-dress-belt', title: 'Classic Dress Belt', category: 'accessories', leather: 'Full-Grain Cowhide', price: 65, featured: false,
    desc: 'A refined belt with a solid brass buckle, burnished edges, and a rich grain that improves with age.',
    images: ['1664286074176-5206ee5dc878', '1711443982852-b3df5c563448'],
    variants: [['CDB-ONYX-90', 'Deep Onyx', '#181311', '90'], ['CDB-BRN-90', 'Vintage Brown', '#5C4033', '90']] },
  { slug: 'brass-buckle-belt', title: 'Brass Buckle Belt', category: 'accessories', leather: 'Vegetable-Tanned Leather', price: 75, featured: false,
    desc: 'A sturdy everyday belt in vegetable-tanned leather with a weighty brass buckle and hand-finished edges.',
    images: ['1711443982852-b3df5c563448', '1664286074176-5206ee5dc878'],
    variants: [['BBB-TAN-95', 'Saddle Tan', '#8B4513', '95']] },
];

const HEROES = ['1623854156816-4c4fc355ffc7', '1605733160314-4fc7dac4bb16', '1598532163257-ae3c6b2524b6', '1551028719-00167b16eac5', '1473188588951-666fce8e7c68'];

async function main() {
  const { data: catRows, error: catErr } = await sb.from('categories').select('id, slug');
  if (catErr) { console.error('categories read failed:', catErr.message); process.exit(1); }
  const cat = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

  // Pre-verify every image once, build a live set.
  const allIds = new Set([...PRODUCTS.flatMap((p) => p.images), ...HEROES]);
  console.log(`Verifying ${allIds.size} image URLs…`);
  const liveIds = new Set();
  for (const id of allIds) {
    const ok = await live(IMG(id));
    if (ok) liveIds.add(id); else console.warn(`  ✗ dead image skipped: ${id}`);
  }
  console.log(`  ${liveIds.size}/${allIds.size} images reachable.`);

  for (const p of PRODUCTS) {
    if (!cat[p.category]) { console.warn(`  skip ${p.slug}: category "${p.category}" missing`); continue; }
    const images = p.images.filter((id) => liveIds.has(id)).map((id) => IMG(id));
    if (!images.length) { console.warn(`  skip ${p.slug}: no live images`); continue; }

    const { data: prod, error: upErr } = await sb.from('products').upsert(
      { category_id: cat[p.category], title: p.title, slug: p.slug, description: p.desc, leather_type: p.leather, base_price_usd: p.price, is_featured: p.featured },
      { onConflict: 'slug' }
    ).select('id').single();
    if (upErr) { console.error(`  ${p.slug}: upsert failed — ${upErr.message}`); continue; }

    await sb.from('product_variants').delete().eq('product_id', prod.id);
    const variants = p.variants.map(([sku, color, hex, size]) => ({ product_id: prod.id, sku, color_name: color, color_hex: hex, size_eu: size, stock_status: 'available' }));
    await sb.from('product_variants').insert(variants);

    await sb.from('product_images').delete().eq('product_id', prod.id);
    const imgRows = images.map((image_url, i) => ({ product_id: prod.id, image_url, is_primary: i === 0, display_order: i }));
    await sb.from('product_images').insert(imgRows);

    console.log(`  ✓ ${p.slug} — ${variants.length} variants, ${images.length} images`);
  }

  // Seed homepage heroes (replace existing managed rows for a clean set).
  const heroUrls = HEROES.filter((id) => liveIds.has(id)).map((id) => IMG(id, 1600));
  if (heroUrls.length) {
    await sb.from('hero_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await sb.from('hero_images').insert(heroUrls.map((image_url, i) => ({ image_url, display_order: i, is_active: true })));
    console.log(`  ✓ ${heroUrls.length} hero images`);
  }

  console.log('Seed complete.');
}
main().catch((e) => { console.error(e); process.exit(1); });

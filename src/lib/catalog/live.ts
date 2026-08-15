import { Product } from '@/lib/types/repository';
import type { Store } from '@/components/ContactClient';
import { fetchSupabaseRows } from '@/lib/supabase-rest';

// Browser-side live catalog read (anon key, public SELECT). Mirrors the build-time
// mapping in src/lib/repositories/index.ts so the storefront shape stays identical.
// Returns null on any failure so callers fall back to the build-time prop.

const SELECT = 'id, title, slug, description, meta_title, meta_description, leather_type, material_title, material_body, care_title, care_body, shipping_title, shipping_body, base_price_usd, is_featured, categories!products_category_id_fkey(slug), product_images(image_url, display_order), product_variants(sku, color_name, color_hex, size_eu, description, image_url, stock_status)';
const LOOK_PRODUCT_SELECT = 'id, title, slug, base_price_usd, categories!products_category_id_fkey(slug), product_images(image_url, display_order)';

// Development reloads and HMR can remount storefront readers frequently.
// Keep the live REST payload cached longer there so development does not create
// an avoidable Supabase egress stream. Admin saves still use explicit refreshes.
const LIVE_CACHE_TTL = process.env.NODE_ENV === 'development' ? 300_000 : 60_000;

type LiveCategoryRow = { slug?: string };
type LiveImageRow = { image_url?: string; display_order?: number };
type LiveVariantRow = { sku?: string; color_name?: string; color_hex?: string | null; size_eu?: string | number | null; description?: string | null; image_url?: string | null; stock_status?: Product['variants'][number]['stockStatus'] };
type LiveProductRow = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  leather_type?: string | null;
  material_title?: string | null;
  material_body?: string | null;
  care_title?: string | null;
  care_body?: string | null;
  shipping_title?: string | null;
  shipping_body?: string | null;
  base_price_usd?: number | string | null;
  is_featured?: boolean | null;
  categories?: LiveCategoryRow | LiveCategoryRow[] | null;
  product_images?: LiveImageRow[] | null;
  product_variants?: LiveVariantRow[] | null;
};
type LiveLookSpotRow = { x?: number; y?: number; image_index?: number | null; display_order?: number; products?: LiveProductRow | LiveProductRow[] | null };
type LiveLookRow = { id: string; title: string; image_url: string; image_url_2?: string | null; display_order?: number | null; look_spots?: LiveLookSpotRow[] | null };

// In-flight promise dedupe + sessionStorage persistence: several components mount
// at once and each calls the same live reader before the cache fills (coalesced to
// one fetch); the result is then persisted so a reload/navigation serves instantly
// while revalidating in the background.
type Holder<T> = { key: string; entry: { value: T; at: number } | null; inflight: Promise<T> | null };
const productHolder: Holder<Product[] | null> = { key: 'praba:products', entry: null, inflight: null };
const productDetailHolders = new Map<string, Holder<Product | null>>();
const heroHolder: Holder<LiveHero[] | null> = { key: 'praba:heroes', entry: null, inflight: null };
const storeHolder: Holder<Store[] | null> = { key: 'praba:stores', entry: null, inflight: null };
const lookHolder: Holder<LiveLook[] | null> = { key: 'praba:looks', entry: null, inflight: null };

function readStored<T>(holder: Holder<T>): { value: T; at: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(holder.key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value: T; at: number };
    if (!parsed || typeof parsed.at !== 'number') return null;
    return parsed;
  } catch { return null; }
}

function writeStored<T>(holder: Holder<T>, value: T) {
  if (typeof window === 'undefined') return;
  try { window.sessionStorage.setItem(holder.key, JSON.stringify({ value, at: Date.now() })); } catch { /* quota / private mode */ }
}

function dedup<T>(holder: Holder<T>, ttl: number, load: () => Promise<T>): Promise<T> {
  // Hydrate from sessionStorage on first access so reloads/navigations resolve
  // instantly instead of re-paying the cold ~1.3s fetch.
  if (!holder.entry) {
    const stored = readStored(holder);
    if (stored) holder.entry = stored;
  }
  if (holder.entry && Date.now() - holder.entry.at < ttl) return Promise.resolve(holder.entry.value);
  if (holder.inflight) return holder.inflight;
  holder.inflight = load()
    .then((value) => { holder.entry = { value, at: Date.now() }; writeStored(holder, value); return value; })
    .finally(() => { holder.inflight = null; });
  return holder.inflight;
}

export function mapLiveProductRow(row: LiveProductRow): Product {
  const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  const slug = cat?.slug;
  return {
    id: row.id,
    name: row.title,
    slug: row.slug,
    category: slug || 'accessories',
    leatherType: row.leather_type || 'Full-Grain Leather',
    basePrice: Number(row.base_price_usd ?? 0),
    description: row.description || '',
    metaTitle: row.meta_title?.trim() || null,
    metaDescription: row.meta_description?.trim() || null,
    specifications: {
      materialTitle: row.material_title || undefined,
      materialBody: row.material_body || undefined,
      careTitle: row.care_title || undefined,
      careBody: row.care_body || undefined,
      shippingTitle: row.shipping_title || undefined,
      shippingBody: row.shipping_body || undefined,
    },
    images: (row.product_images || []).slice().sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0)).map((i) => i.image_url).filter((image): image is string => Boolean(image)),
    variants: (row.product_variants || []).map((v) => ({
      sku: v.sku || '',
      color: v.color_name || '',
      colorHex: v.color_hex || undefined,
      size: v.size_eu == null ? undefined : String(v.size_eu),
      description: v.description?.trim() || undefined,
      image: v.image_url || undefined,
      priceAdjustment: 0,
      stockStatus: v.stock_status || 'available',
    })),
    isFeatured: Boolean(row.is_featured),
  };
}

export async function fetchLiveProducts(fresh = false): Promise<Product[] | null> {
  if (fresh) {
    productHolder.entry = null;
    if (typeof window !== 'undefined') {
      try { window.sessionStorage.removeItem(productHolder.key); } catch { /* private mode */ }
    }
  }
  try {
    return await dedup(productHolder, LIVE_CACHE_TTL, async () => {
      const data = await fetchSupabaseRows<LiveProductRow>('products', { select: SELECT, order: 'is_featured.desc' });
      return data.length ? data.map(mapLiveProductRow) : null;
    });
  } catch {
    return null;
  }
}

export async function fetchLiveProductBySlug(slug: string): Promise<Product | null> {
  const key = `praba:product:${slug}`;
  const holder = productDetailHolders.get(slug) ?? { key, entry: null, inflight: null };
  productDetailHolders.set(slug, holder);
  return dedup(holder, LIVE_CACHE_TTL, async () => {
    const data = await fetchSupabaseRows<LiveProductRow>('products', { select: SELECT, slug: `eq.${slug}`, limit: '1' });
    return data[0] ? mapLiveProductRow(data[0]) : null;
  });
}

// --- Phase 2 content: heroes, looks, stores -------------------------------

export type LiveHero = { image_url: string; alt_text: string; caption: string };

export async function fetchLiveHeroes(): Promise<LiveHero[] | null> {
  try {
    return await dedup(heroHolder, LIVE_CACHE_TTL, async () => {
      const data = await fetchSupabaseRows<{ image_url: string; alt_text?: string | null; caption?: string | null }>('hero_images', { select: 'image_url,alt_text,caption', is_active: 'eq.true', order: 'display_order.asc' });
      return data.length ? data.map((r) => ({ image_url: r.image_url, alt_text: r.alt_text ?? 'Editorial view of handcrafted leather', caption: r.caption ?? '' })) : null;
    });
  } catch {
    return null;
  }
}

export async function fetchLiveStores(): Promise<Store[] | null> {
  try {
    return await dedup(storeHolder, LIVE_CACHE_TTL, async () => {
      const data = await fetchSupabaseRows<{ name: string; address?: string | null; phone?: string | null; phone_href?: string | null; email?: string | null; hours?: string | null; map_query?: string | null }>('stores', { select: 'name,address,phone,phone_href,email,hours,map_query', is_active: 'eq.true', order: 'display_order.asc' });
      if (!data.length) return null;
      return data.map((r) => ({
        name: r.name, address: r.address ?? '', phone: r.phone ?? '', phoneHref: r.phone_href ?? '',
        email: r.email ?? '', hours: r.hours ?? '', mapQuery: r.map_query ?? '',
      }));
    });
  } catch {
    return null;
  }
}

export interface LiveLook { id: string; image: string; images: string[]; title: string; displayOrder: number; spots: { product: Product; x: number; y: number; imageIndex: number }[]; }

export async function fetchLiveLooks(): Promise<LiveLook[] | null> {
  try {
    return await dedup(lookHolder, LIVE_CACHE_TTL, async () => {
      const rows = await fetchSupabaseRows<LiveLookRow>('looks', { select: `id,title,image_url,image_url_2,display_order,is_active,look_spots(id,x,y,image_index,display_order,products(${LOOK_PRODUCT_SELECT}))`, is_active: 'eq.true', order: 'display_order.asc' });
      if (!rows.length) return null;
      return rows.map((row) => {
        const images = [row.image_url, row.image_url_2].filter((image): image is string => Boolean(image));
        return {
          id: row.id,
          image: row.image_url,
          images,
          title: row.title,
          displayOrder: Number(row.display_order ?? 0),
          spots: (row.look_spots ?? [])
            .sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0))
            .map((s) => ({ ...s, product: Array.isArray(s.products) ? s.products[0] : s.products }))
            .filter((s): s is LiveLookSpotRow & { product: LiveProductRow } => Boolean(s.product))
            .map((s) => ({ product: mapLiveProductRow(s.product), x: Number(s.x), y: Number(s.y), imageIndex: Number(s.image_index ?? 0) })),
        };
      });
    });
  } catch {
    return null;
  }
}

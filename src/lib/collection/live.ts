import { supabase } from '@/lib/supabase';
import { mapLiveProductRow } from '@/lib/catalog/live';
import { normalizeCollectionSubcategory, type CollectionSubcategory } from '@/lib/content/defaults';
import type { Product } from '@/lib/types/repository';

const PRODUCT_SELECT = 'id, title, slug, description, leather_type, base_price_usd, is_featured, categories(slug), product_images(image_url, display_order), product_variants(sku, color_name, color_hex, size_eu, image_url, stock_status)';

export type CollectionProductGroup = {
  categoryId: string;
  categorySlug: string;
  subcategorySlug: string;
  products: Product[];
};

type RawCollectionProductGroup = {
  category_id: string;
  subcategory_slug: string;
  categories: { slug: string } | { slug: string }[] | null;
  products: unknown | unknown[] | null;
};

const GROUP_CACHE_TTL = 60_000;
const groupHolder: { key: string; entry: { value: CollectionProductGroup[]; at: number } | null; inflight: Promise<CollectionProductGroup[]> | null } = { key: 'praba:groups', entry: null, inflight: null };

function readStoredGroups() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(groupHolder.key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value: CollectionProductGroup[]; at: number };
    return typeof parsed?.at === 'number' ? parsed : null;
  } catch { return null; }
}

export async function fetchLiveCollectionProductGroups(): Promise<CollectionProductGroup[] | null> {
  if (!supabase) return null;
  if (!groupHolder.entry) {
    const stored = readStoredGroups();
    if (stored) groupHolder.entry = stored;
  }
  if (groupHolder.entry && Date.now() - groupHolder.entry.at < GROUP_CACHE_TTL) return groupHolder.entry.value;
  if (groupHolder.inflight) return groupHolder.inflight;
  groupHolder.inflight = (async () => {
    const { data, error } = await supabase!.from('collection_product_groups')
      .select(`category_id, subcategory_slug, display_order, categories(slug), products(${PRODUCT_SELECT})`)
      .order('display_order');
    if (error || !data) return [];
    const groups = new Map<string, CollectionProductGroup>();
    for (const row of data as unknown as RawCollectionProductGroup[]) {
      const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      if (!category?.slug || !product) continue;
      const key = `${category.slug}:${row.subcategory_slug}`;
      const group: CollectionProductGroup = groups.get(key) ?? { categoryId: row.category_id, categorySlug: category.slug, subcategorySlug: row.subcategory_slug, products: [] };
      group.products.push(mapLiveProductRow(product));
      groups.set(key, group);
    }
    const value = [...groups.values()];
    groupHolder.entry = { value, at: Date.now() };
    try { window.sessionStorage.setItem(groupHolder.key, JSON.stringify({ value, at: Date.now() })); } catch { /* quota */ }
    return value;
  })().finally(() => { groupHolder.inflight = null; });
  try {
    const value = await groupHolder.inflight;
    return value.length ? value : null;
  } catch {
    return null;
  }
}

export function collectionSubcategorySlug(value: CollectionSubcategory | string) {
  return normalizeCollectionSubcategory(value).slug;
}

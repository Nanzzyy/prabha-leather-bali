import { fetchLiveProducts } from '@/lib/catalog/live';
import type { Product } from '@/lib/types/repository';
import { fetchSupabaseRows } from '@/lib/supabase-rest';

export type CollectionProductGroup = {
  categoryId: string;
  categorySlug: string;
  subcategorySlug: string;
  products: Product[];
};

type RawCollectionProductGroup = {
  category_id: string;
  subcategory_slug: string;
  product_id: string;
  categories: { slug: string } | { slug: string }[] | null;
};

const GROUP_CACHE_TTL = process.env.NODE_ENV === 'development' ? 300_000 : 60_000;
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

export async function fetchLiveCollectionProductGroups(initialProducts?: Product[]): Promise<CollectionProductGroup[] | null> {
  if (!groupHolder.entry) {
    const stored = readStoredGroups();
    if (stored) groupHolder.entry = stored;
  }
  if (groupHolder.entry && Date.now() - groupHolder.entry.at < GROUP_CACHE_TTL) return groupHolder.entry.value;
  if (groupHolder.inflight) return groupHolder.inflight;
  groupHolder.inflight = (async () => {
    // Product data is already cached by the catalog reader. Returning only the
    // foreign key here avoids repeating gallery URLs and variants once per
    // collection assignment.
    const [data, products] = await Promise.all([
      fetchSupabaseRows<RawCollectionProductGroup>('collection_product_groups', {
        select: 'category_id,subcategory_slug,display_order,product_id,categories!collection_product_groups_category_id_fkey(slug)',
        order: 'display_order.asc',
      }),
      initialProducts ? Promise.resolve(initialProducts) : fetchLiveProducts(),
    ]);
    const productsById = new Map((products ?? []).map((product) => [product.id, product]));
    const groups = new Map<string, CollectionProductGroup>();
    for (const row of data) {
      const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
      const product = productsById.get(row.product_id);
      if (!category?.slug || !product) continue;
      const key = `${category.slug}:${row.subcategory_slug}`;
      const group: CollectionProductGroup = groups.get(key) ?? { categoryId: row.category_id, categorySlug: category.slug, subcategorySlug: row.subcategory_slug, products: [] };
      group.products.push(product);
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

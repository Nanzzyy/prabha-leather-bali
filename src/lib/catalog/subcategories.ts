import { normalizeCollectionSubcategory, type CollectionSubcategory } from '@/lib/content/defaults';
import type { CollectionProductGroup } from '@/lib/collection/live';
import type { Product } from '@/lib/types/repository';

// Single source of truth for the default product↔subcategory mapping used as a
// fallback when the DB has no collection_product_groups rows yet. Mirrors the
// seed in supabase/collection-product-groups.sql so the storefront is never empty.
export const fallbackSubcategoryAssignments: Record<string, string[]> = {
  'bags:totes': ['ubud-weave-tote'],
  'bags:briefcases': ['heritage-briefcase'],
  'bags:everyday-bags': ['ubud-weave-tote', 'heritage-briefcase', 'praba-sample-piece'],
  'boots:heritage-boots': ['the-duke-heritage-boot'],
  'boots:everyday-boots': ['the-duke-heritage-boot'],
  'boots:lace-up-boots': ['the-duke-heritage-boot'],
  'wallets:cardholders': ['artisan-cardholder-set'],
  'accessories:belts': ['classic-dress-belt'],
  'jackets:moto-jackets': ['onyx-moto-jacket'],
  'jackets:outerwear': ['onyx-moto-jacket'],
};

/** Map every product slug to the set of subcategory slugs it belongs to, for one category. */
export function buildSubcategoryAssignments(
  categorySlug: string,
  products: Product[],
  groups: CollectionProductGroup[] | null,
): Map<string, Set<string>> {
  const assignments = new Map<string, Set<string>>();
  const add = (productSlug: string, subSlug: string) => {
    if (!assignments.has(productSlug)) assignments.set(productSlug, new Set());
    assignments.get(productSlug)!.add(subSlug);
  };

  const liveGroups = (groups ?? []).filter((group) => group.categorySlug === categorySlug);
  if (liveGroups.length) {
    for (const group of liveGroups) for (const product of group.products) add(product.slug, group.subcategorySlug);
    return assignments;
  }

  for (const product of products) {
    if (product.category !== categorySlug) continue;
    for (const [key, slugs] of Object.entries(fallbackSubcategoryAssignments)) {
      const [cat, sub] = key.split(':');
      if (cat === categorySlug && slugs.includes(product.slug)) add(product.slug, sub);
    }
  }
  return assignments;
}

/** Subcategory list (stable slugs + titles) for a category, from content + normalized. */
export function subcategoriesFor(entries: Array<CollectionSubcategory | string>): CollectionSubcategory[] {
  return entries.map(normalizeCollectionSubcategory);
}

/** True when the product is in the selected subcategory (or subcategory is 'all'). */
export function matchesSubcategory(
  product: Product,
  assignments: Map<string, Set<string>>,
  subcategorySlug: string,
): boolean {
  if (subcategorySlug === 'all') return true;
  return assignments.get(product.slug)?.has(subcategorySlug) ?? false;
}

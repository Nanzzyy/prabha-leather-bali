import { normalizeCollectionSubcategory, type CollectionSubcategory } from '@/lib/content/defaults';

export function collectionSubcategorySlug(value: CollectionSubcategory | string) {
  return normalizeCollectionSubcategory(value).slug;
}

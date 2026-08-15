import { IProductRepository } from '../types/repository';
import { catalogProducts } from '../data/catalog';
import { supabase } from '../supabase';
import { PostgresAdapter } from './PostgresAdapter';
import { unstable_cache } from 'next/cache';

// Singleton instance to avoid multiple DB connections in dev
let repositoryInstance: IProductRepository | null = null;

export function getProductRepository(): IProductRepository {
  if (repositoryInstance) return repositoryInstance;

  const driver = process.env.DATA_SOURCE_DRIVER || 'postgres';

  switch (driver) {
    case 'postgres':
      repositoryInstance = new PostgresAdapter();
      break;
    case 'sheets':
      // repositoryInstance = new SheetsAdapter();
      throw new Error("Sheets driver not yet implemented.");
    case 'supabase':
      // repositoryInstance = new SupabaseAdapter();
      throw new Error("Supabase driver not yet implemented.");
    default:
      console.warn(`Driver ${driver} unknown, defaulting to postgres.`);
      repositoryInstance = new PostgresAdapter();
  }

  return repositoryInstance;
}

async function getCatalogProductsUncached() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, slug, description, meta_title, meta_description, leather_type, material_title, material_body, care_title, care_body, shipping_title, shipping_body, base_price_usd, is_featured, categories!products_category_id_fkey(slug), product_images(image_url, display_order), product_variants(sku, color_name, color_hex, size_eu, description, image_url, stock_status)')
        .order('is_featured', { ascending: false });

      if (!error && data?.length) {
        return data.map((row) => ({
          // PostgREST returns to-one relations as objects and to-many relations as arrays.
          category: ((Array.isArray(row.categories) ? row.categories[0] : row.categories)?.slug || 'accessories') as typeof catalogProducts[number]['category'],
          id: row.id,
          name: row.title,
          slug: row.slug,
          leatherType: row.leather_type || 'Full-Grain Leather',
          basePrice: Number(row.base_price_usd),
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
          images: (row.product_images || []).sort((a, b) => a.display_order - b.display_order).map((image) => image.image_url),
          variants: (row.product_variants || []).map((item) => ({
            sku: item.sku,
            color: item.color_name,
            colorHex: item.color_hex || undefined,
            size: item.size_eu || undefined,
            description: item.description || undefined,
            image: item.image_url || undefined,
            priceAdjustment: 0,
            stockStatus: item.stock_status,
          })),
          isFeatured: row.is_featured,
        }));
      }
    } catch (error) {
      console.warn('Supabase catalog unavailable; using local catalog fallback.', error);
    }

    // A public storefront must never wait for a second database connection
    // after the public Supabase read has already failed. In production that
    // fallback can be a cold/private Postgres host and add another 10 seconds
    // to the first request. The bundled catalog keeps the page usable while
    // the CMS recovers; admin/database workflows remain unchanged.
    if (process.env.NODE_ENV === 'production') return catalogProducts;
  }

  const databaseProducts = await getProductRepository().getAllProducts();
  return databaseProducts.length ? databaseProducts : catalogProducts;
}

// The catalog is public and identical for every visitor. Keep one server-side
// result for a short window so every static/SSR page does not repeat the same
// full relational read. CMS edits become visible after the revalidation window
// without changing the existing fallback behavior.
const getCachedCatalogProducts = unstable_cache(
  getCatalogProductsUncached,
  ['public-catalog-products'],
  { revalidate: process.env.NODE_ENV === 'development' ? 300 : 60, tags: ['public-catalog-products'] },
);

export async function getCatalogProducts() {
  return getCachedCatalogProducts();
}

export async function getCatalogProductBySlug(slug: string) {
  const products = await getCatalogProducts();
  return products.find((product) => product.slug === slug) || catalogProducts.find((product) => product.slug === slug) || null;
}

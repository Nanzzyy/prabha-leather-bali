import { IProductRepository } from '../types/repository';
import { catalogProducts } from '../data/catalog';
import { supabase } from '../supabase';
import { PostgresAdapter } from './PostgresAdapter';

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

export async function getCatalogProducts() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, slug, description, leather_type, base_price_usd, is_featured, categories!products_category_id_fkey(slug), product_images(image_url, display_order), product_variants(sku, color_name, color_hex, size_eu, image_url, stock_status)')
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
          images: (row.product_images || []).sort((a, b) => a.display_order - b.display_order).map((image) => image.image_url),
          variants: (row.product_variants || []).map((item) => ({
            sku: item.sku,
            color: item.color_name,
            colorHex: item.color_hex || undefined,
            size: item.size_eu || undefined,
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
  }

  const databaseProducts = await getProductRepository().getAllProducts();
  return databaseProducts.length ? databaseProducts : catalogProducts;
}

export async function getCatalogProductBySlug(slug: string) {
  const products = await getCatalogProducts();
  return products.find((product) => product.slug === slug) || catalogProducts.find((product) => product.slug === slug) || null;
}

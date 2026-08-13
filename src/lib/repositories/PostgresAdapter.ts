import { Pool } from 'pg';
import { IProductRepository, Product } from '../types/repository';

if (typeof window !== 'undefined') {
  throw new Error('PostgresAdapter must not be imported in a browser context. Keep DATABASE_URL server-side only.');
}

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    })
  : null;

export class PostgresAdapter implements IProductRepository {
  async getAllProducts(): Promise<Product[]> {
    if (!pool) return [];

    let client;
    try {
      client = await pool.connect();
      const result = await client.query(`
        SELECT p.id, p.title, p.slug, p.description, p.leather_type,
          p.material_title, p.material_body, p.care_title, p.care_body,
          p.shipping_title, p.shipping_body, p.base_price_usd,
          p.is_featured, c.slug AS category,
          COALESCE(
            (SELECT json_agg(pi.image_url ORDER BY pi.display_order)
             FROM product_images pi WHERE pi.product_id = p.id), '[]'
          ) AS images,
          COALESCE(
            (SELECT json_agg(jsonb_build_object(
              'sku', v.sku, 'color', v.color_name, 'colorHex', v.color_hex,
              'size', v.size_eu, 'description', v.description, 'image', v.image_url, 'priceAdjustment', 0, 'stockStatus', v.stock_status
            ) ORDER BY v.sku) FROM product_variants v WHERE v.product_id = p.id), '[]'
          ) AS variants
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        ORDER BY p.is_featured DESC, p.created_at DESC
      `);

      return result.rows.map(mapProductRow);
    } catch (error) {
      console.error('Error fetching products from Postgres:', error);
      return []; // fallback or throw
    } finally {
      client?.release();
    }
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!pool) return null;

    let client;
    try {
      client = await pool.connect();
      const result = await client.query(`
        SELECT p.id, p.title, p.slug, p.description, p.leather_type,
          p.material_title, p.material_body, p.care_title, p.care_body,
          p.shipping_title, p.shipping_body, p.base_price_usd,
          p.is_featured, c.slug AS category,
          COALESCE(
            (SELECT json_agg(pi.image_url ORDER BY pi.display_order)
             FROM product_images pi WHERE pi.product_id = p.id), '[]'
          ) AS images,
          COALESCE(
            (SELECT json_agg(jsonb_build_object(
              'sku', v.sku, 'color', v.color_name, 'colorHex', v.color_hex,
              'size', v.size_eu, 'image', v.image_url, 'priceAdjustment', 0, 'stockStatus', v.stock_status
            ) ORDER BY v.sku) FROM product_variants v WHERE v.product_id = p.id), '[]'
          ) AS variants
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.slug = $1
      `, [slug]);

      if (result.rows.length === 0) return null;
      return mapProductRow(result.rows[0]);
    } catch (error) {
      console.error('Error fetching product by slug from Postgres:', error);
      return null;
    } finally {
      client?.release();
    }
  }

  async getCategories(): Promise<string[]> {
    if (!pool) return [];

    let client;
    try {
      client = await pool.connect();
      const result = await client.query(`
        SELECT slug FROM categories ORDER BY name
      `);
      return result.rows.map(row => row.slug);
    } catch (error) {
      console.error('Error fetching categories from Postgres:', error);
      return [];
    } finally {
      client?.release();
    }
  }
}

function mapProductRow(row: Record<string, unknown>): Product {
  const category = String(row.category || 'accessories');

  return {
    id: String(row.id),
    name: String(row.title || 'Untitled product'),
    slug: String(row.slug),
    category,
    leatherType: String(row.leather_type || 'Full-Grain Leather'),
    basePrice: Number(row.base_price_usd || 0),
    description: String(row.description || ''),
    specifications: {
      materialTitle: row.material_title ? String(row.material_title) : undefined,
      materialBody: row.material_body ? String(row.material_body) : undefined,
      careTitle: row.care_title ? String(row.care_title) : undefined,
      careBody: row.care_body ? String(row.care_body) : undefined,
      shippingTitle: row.shipping_title ? String(row.shipping_title) : undefined,
      shippingBody: row.shipping_body ? String(row.shipping_body) : undefined,
    },
    images: Array.isArray(row.images) ? row.images as string[] : [],
    variants: Array.isArray(row.variants) ? row.variants as Product['variants'] : [],
    isFeatured: Boolean(row.is_featured),
  };
}

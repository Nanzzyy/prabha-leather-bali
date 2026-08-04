import { Pool } from 'pg';
import { IProductRepository, Product, ProductVariant } from '../types/repository';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class PostgresAdapter implements IProductRepository {
  async getAllProducts(): Promise<Product[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT p.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'sku', v.sku,
                'color', v.color,
                'size', v.size,
                'priceAdjustment', v.price_adjustment,
                'stockStatus', v.stock_status
              )
            ) FILTER (WHERE v.sku IS NOT NULL), '[]'
          ) as variants
        FROM products p
        LEFT JOIN product_variants v ON p.id = v.product_id
        GROUP BY p.id
      `);

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        category: row.category,
        basePrice: parseFloat(row.base_price),
        description: row.description,
        images: row.images || [],
        variants: row.variants,
        isFeatured: row.is_featured
      }));
    } catch (error) {
      console.error('Error fetching products from Postgres:', error);
      return []; // fallback or throw
    } finally {
      client.release();
    }
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT p.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'sku', v.sku,
                'color', v.color,
                'size', v.size,
                'priceAdjustment', v.price_adjustment,
                'stockStatus', v.stock_status
              )
            ) FILTER (WHERE v.sku IS NOT NULL), '[]'
          ) as variants
        FROM products p
        LEFT JOIN product_variants v ON p.id = v.product_id
        WHERE p.slug = $1
        GROUP BY p.id
      `, [slug]);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        category: row.category,
        basePrice: parseFloat(row.base_price),
        description: row.description,
        images: row.images || [],
        variants: row.variants,
        isFeatured: row.is_featured
      };
    } catch (error) {
      console.error('Error fetching product by slug from Postgres:', error);
      return null;
    } finally {
      client.release();
    }
  }

  async getCategories(): Promise<string[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT DISTINCT category FROM products WHERE category IS NOT NULL
      `);
      return result.rows.map(row => row.category);
    } catch (error) {
      console.error('Error fetching categories from Postgres:', error);
      return [];
    } finally {
      client.release();
    }
  }
}

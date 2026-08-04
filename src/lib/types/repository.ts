export interface ProductVariant {
  sku: string;
  color: string;
  size?: string;
  priceAdjustment: number;
  stockStatus: 'available' | 'preorder' | 'out_of_stock';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'boots' | 'bags' | 'wallets' | 'accessories';
  basePrice: number;
  description: string;
  images: string[];
  variants: ProductVariant[];
  isFeatured: boolean;
}

export interface IProductRepository {
  getAllProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getCategories(): Promise<string[]>;
}

export interface ProductVariant {
  sku: string;
  color: string;
  colorHex?: string;
  size?: string;
  description?: string | null;
  image?: string;
  priceAdjustment: number;
  stockStatus: 'available' | 'preorder' | 'out_of_stock';
}

export interface ProductSpecifications {
  materialTitle?: string | null;
  materialBody?: string | null;
  careTitle?: string | null;
  careBody?: string | null;
  shippingTitle?: string | null;
  shippingBody?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'boots' | 'bags' | 'wallets' | 'accessories' | 'jackets';
  leatherType: string;
  basePrice: number;
  description: string;
  specifications?: ProductSpecifications;
  images: string[];
  variants: ProductVariant[];
  isFeatured: boolean;
}

export interface IProductRepository {
  getAllProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getCategories(): Promise<string[]>;
}

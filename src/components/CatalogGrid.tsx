'use client';

import { Product } from '@/lib/types/repository';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function CatalogGrid({ products, onProductClick }: Props) {
  if (products.length === 0) {
    return <div className="text-center py-10 text-gray-500">Tidak ada produk ditemukan.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onClick={onProductClick} 
        />
      ))}
    </div>
  );
}

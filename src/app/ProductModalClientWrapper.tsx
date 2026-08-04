'use client';

import { useState } from 'react';
import { Product } from '@/lib/types/repository';
import CatalogGrid from '@/components/CatalogGrid';
import ProductModal from '@/components/ProductModal';

interface Props {
  products: Product[];
}

export default function ProductModalClientWrapper({ products }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <CatalogGrid products={products} onProductClick={setSelectedProduct} />
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  );
}

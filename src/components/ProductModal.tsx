'use client';

import { useState } from 'react';
import { Product, ProductVariant } from '@/lib/types/repository';
import { useCartStore } from '@/lib/store/cartStore';
import Image from 'next/image';

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(product, selectedVariant, quantity);
      onClose();
    }
  };

  const currentPrice = product.basePrice + (selectedVariant?.priceAdjustment || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-black">{product.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
        </div>
        
        <div className="p-4 flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2 relative h-64 md:h-auto bg-gray-100 rounded-md overflow-hidden">
            {product.images[0] ? (
              <Image 
                src={product.images[0]} 
                alt={product.name} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">No Image</div>
            )}
          </div>
          
          <div className="md:w-1/2 flex flex-col">
            <p className="text-2xl font-bold text-black mb-4">
              Rp {currentPrice.toLocaleString('id-ID')}
            </p>
            <p className="text-gray-600 mb-6 text-sm">{product.description}</p>
            
            {/* Variants */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Varian</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(variant => (
                  <button
                    key={variant.sku}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      selectedVariant?.sku === variant.sku 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {variant.color} {variant.size ? `- ${variant.size}` : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6 flex items-center gap-4">
              <label className="block text-sm font-medium text-gray-700">Jumlah</label>
              <div className="flex items-center border rounded-md">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-1 text-black hover:bg-gray-100"
                >-</button>
                <span className="px-3 py-1 text-black border-x">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-1 text-black hover:bg-gray-100"
                >+</button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stockStatus === 'out_of_stock'}
              className="mt-auto w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {!selectedVariant 
                ? 'Pilih Varian' 
                : selectedVariant.stockStatus === 'out_of_stock' 
                  ? 'Stok Habis' 
                  : 'Tambah ke Keranjang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

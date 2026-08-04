import { Product } from '@/lib/types/repository';
import Image from 'next/image';

interface Props {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: Props) {
  // Use first variant price if available, else basePrice
  const minPrice = product.basePrice;

  return (
    <div 
      className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white"
      onClick={() => onClick(product)}
    >
      <div className="relative w-full h-48 bg-gray-200">
        {product.images[0] ? (
          <Image 
            src={product.images[0]} 
            alt={product.name} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate text-black">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2 capitalize">{product.category}</p>
        <p className="font-bold text-black">
          Rp {minPrice.toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
}

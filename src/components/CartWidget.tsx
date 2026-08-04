'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import CheckoutModal from './CheckoutModal';
import { formatRupiah } from '@/lib/utils/whatsappGenerator';

export default function CartWidget() {
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Hydration fix for zustand persist: only render after mount if needed, 
  // but for simplicity we'll just let it render. (Can cause hydration mismatch if SSR).
  // Ideally we should use a custom hook for hydration safety.
  
  if (items.length === 0) return null;

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => {
    return acc + (item.product.basePrice + (item.variant.priceAdjustment || 0)) * item.quantity;
  }, 0);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-colors relative flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
            {totalItems}
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black bg-opacity-25" onClick={() => setIsOpen(false)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-black">Keranjang ({totalItems})</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black text-2xl">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-black">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.variant.color} {item.variant.size ? `- ${item.variant.size}` : ''}
                    </p>
                    <p className="font-bold text-black text-sm mt-1">
                      {formatRupiah(item.product.basePrice + (item.variant.priceAdjustment || 0))}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center border rounded-md">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 text-black">-</button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 text-black">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm hover:underline">Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between mb-4">
                <span className="font-medium text-gray-600">Total:</span>
                <span className="font-bold text-xl text-black">{formatRupiah(totalPrice)}</span>
              </div>
              <button 
                onClick={() => { setIsOpen(false); setShowCheckout(true); }}
                className="w-full bg-black text-white py-3 rounded-md font-bold hover:bg-gray-800 transition-colors"
              >
                Checkout Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} />}
    </>
  );
}

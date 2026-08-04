'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { generateWhatsAppPayload, formatRupiah } from '@/lib/utils/whatsappGenerator';

interface Props {
  onClose: () => void;
}

export default function CheckoutModal({ onClose }: Props) {
  const items = useCartStore(state => state.items);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  const totalPrice = items.reduce((acc, item) => {
    return acc + (item.product.basePrice + (item.variant.priceAdjustment || 0)) * item.quantity;
  }, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const url = generateWhatsAppPayload(items, { name, notes });
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-black">Checkout via WhatsApp</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={handleCheckout} className="p-4 flex flex-col gap-4">
          <div className="bg-gray-50 p-3 rounded-md mb-2 border">
            <p className="text-sm text-gray-600 mb-1">Total Pesanan ({items.length} item):</p>
            <p className="font-bold text-lg text-black">{formatRupiah(totalPrice)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-black focus:border-black text-black"
              placeholder="Masukkan nama Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 h-24 focus:ring-black focus:border-black text-black"
              placeholder="Detail ukuran khusus, warna pengganti, dll."
            ></textarea>
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-[#25D366] text-white py-3 rounded-md font-bold hover:bg-[#128C7E] transition-colors flex justify-center items-center gap-2"
          >
            Lanjutkan ke WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}

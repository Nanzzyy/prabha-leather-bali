import { CartItem } from '../store/cartStore';

interface CustomerData {
  name: string;
  notes: string;
}

const BRAND_NAME = "Prabha Leather Bali";
const ADMIN_PHONE = "6281234567890"; // Ganti dengan nomor WhatsApp admin yang sebenarnya

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

export function generateWhatsAppPayload(cartItems: CartItem[], customer: CustomerData): string {
  let message = `Halo Admin *${BRAND_NAME}*! Saya ingin memesan produk berikut:\n\n`;
  message += `*DAFTAR PESANAN:*\n`;

  let totalPrice = 0;

  cartItems.forEach((item, index) => {
    const itemPrice = item.product.basePrice + (item.variant.priceAdjustment || 0);
    const subtotal = itemPrice * item.quantity;
    totalPrice += subtotal;

    message += `${index + 1}. *${item.product.name}*\n`;
    
    // Construct variant string
    const variantParts = [item.variant.color];
    if (item.variant.size) variantParts.push(`Size ${item.variant.size}`);
    
    message += `   - Varian: ${variantParts.join(' / ')}\n`;
    message += `   - Qty: ${item.quantity} x ${formatRupiah(itemPrice)}\n`;
  });

  message += `\n----------------------------------\n`;
  message += `*Total Estimasi:* ${formatRupiah(totalPrice)}\n`;
  message += `----------------------------------\n\n`;

  message += `*DATA PEMESAN:*\n`;
  message += `- Nama: ${customer.name.trim()}\n`;
  message += `- Catatan: ${customer.notes.trim() || '-'}\n\n`;

  message += `Mohon konfirmasi ketersediaan stok dan total ongkirnya. Terima kasih!`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${ADMIN_PHONE}?text=${encodedMessage}`;
}

import { CartItem } from '../store/cartStore';

interface CustomerData {
  name: string;
  destination: string;
  notes?: string;
}

const BRAND_NAME = "Praba Leather Bali";
const ADMIN_PHONE = "6281234567890"; // Ganti dengan nomor WhatsApp admin yang sebenarnya

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

export function generateWhatsAppPayload(cartItems: CartItem[], customer: CustomerData): string {
  const name = customer.name.trim();
  const destination = customer.destination.trim();
  const notes = customer.notes?.trim();

  let message = `Hi, I'm ${name || 'there'}, I'd like to check out the following item${cartItems.length === 1 ? '' : 's'}:\n\n`;

  message += `*ORDER DETAILS*\n`;
  let totalPrice = 0;
  cartItems.forEach((item, index) => {
    const itemPrice = item.product.basePrice + (item.variant.priceAdjustment || 0);
    const subtotal = itemPrice * item.quantity;
    totalPrice += subtotal;

    message += `${index + 1}. *${item.product.name}*\n`;
    const variantParts = [item.variant.color];
    if (item.variant.size) variantParts.push(`Size ${item.variant.size}`);
    message += `   - Variant: ${variantParts.join(' / ')}\n`;
    if (item.customEmboss) message += `   - Custom stamp: "${item.customEmboss}"\n`;
    message += `   - Price: ${formatUSD(itemPrice)} x ${item.quantity}\n`;
  });

  message += `\n----------------------------------\n`;
  message += `*Estimated subtotal:* ${formatUSD(totalPrice)}\n`;
  message += `----------------------------------\n\n`;

  message += `*DELIVERY*\n- ${destination || '—'}\n\n`;

  if (notes) message += `*NOTE FOR ARTISAN*\n${notes}\n\n`;

  message += `Please confirm stock availability and shipping costs. Thank you! — ${BRAND_NAME}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${ADMIN_PHONE}?text=${encodedMessage}`;
}

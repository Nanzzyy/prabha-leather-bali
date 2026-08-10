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

  let message = `Hi Praba Leather Bali 👋\n\n`;
  message += `I'm ${name || '[Name]'} from ${destination || '[Region]'}.\n`;
  message += `I'm really interested in the following piece${cartItems.length === 1 ? '' : 's'} in my pouch:\n\n`;

  message += `*ITEMS IN MY POUCH*\n`;
  let totalPrice = 0;
  cartItems.forEach((item, index) => {
    const itemPrice = item.product.basePrice + (item.variant.priceAdjustment || 0);
    const subtotal = itemPrice * item.quantity;
    totalPrice += subtotal;

    message += `${index + 1}. *${item.product.name}*\n`;
    const variantParts = item.variant.color ? [`Color: ${item.variant.color}`] : [];
    if (item.variant.size) variantParts.push(`Size ${item.variant.size}`);
    if (variantParts.length) message += `   • ${variantParts.join(' · ')}\n`;
    if (item.customEmboss) message += `   • Custom stamp: "${item.customEmboss}"\n`;
    message += `   • ${formatUSD(itemPrice)} × ${item.quantity}\n`;
  });

  message += `\n*ESTIMATED TOTAL*  ${formatUSD(totalPrice)}\n`;
  message += `*SHIPPING TO*  ${destination || '[Region]'}\n\n`;

  if (notes) message += `*NOTE FOR THE ARTISAN*\n${notes}\n\n`;

  message += `Could you please confirm availability, personalization, and shipping options?\n\nThank you!\n${name || 'A Praba Leather customer'} — ${BRAND_NAME}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${ADMIN_PHONE}?text=${encodedMessage}`;
}

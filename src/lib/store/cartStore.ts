import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '../types/repository';

export interface CartItem {
  id: string; // unique cart item id (e.g. product.id + variant.sku)
  product: Pick<Product, 'id' | 'name' | 'slug' | 'basePrice'> & { image?: string };
  variant: ProductVariant;
  quantity: number;
  customEmboss?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, variant: ProductVariant, quantity?: number, customEmboss?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, variant, quantity = 1, customEmboss = '') => {
        const normalizedEmboss = customEmboss.trim();
        const cartItemId = `${product.id}-${variant.sku}-${normalizedEmboss.toLowerCase() || 'none'}`;
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === cartItemId);

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === cartItemId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [...currentItems, {
              id: cartItemId,
              product: { id: product.id, name: product.name, slug: product.slug, basePrice: product.basePrice, image: product.images[0] },
              variant,
              quantity,
              customEmboss: normalizedEmboss || undefined,
            }],
          });
        }
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((item) => item.id !== id)
            : state.items.map((item) => item.id === id ? { ...item, quantity } : item),
        })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'leather-cart-storage', // key in localStorage
      version: 2,
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState) => {
        const state = persistedState as { items?: Array<CartItem & { product: CartItem['product'] & { images?: string[] } }> };
        return {
          items: (state.items ?? []).map((item) => ({
            ...item,
            product: {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              basePrice: item.product.basePrice,
              image: item.product.image ?? item.product.images?.[0],
            },
          })),
          isOpen: false,
        };
      },
    }
  )
);

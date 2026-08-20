import { getCatalogProducts } from '@/lib/repositories';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types/repository';

export interface LivePromoItem {
  id: string;
  productId: string;
  promoPrice: number;
  displayOrder: number;
  product: Product;
}

export interface LivePromoCampaign {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  items: LivePromoItem[];
}

type PromoRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  display_order?: number | null;
  promo_items?: Array<{ id: string; product_id: string; promo_price_usd: number | string; display_order?: number | null }> | null;
};

export async function getLivePromoCampaigns(): Promise<LivePromoCampaign[]> {
  if (!supabase) return [];
  try {
    const [{ data, error }, products] = await Promise.all([
      supabase
        .from('promo_campaigns')
        .select('id, name, slug, description, display_order, promo_items(id, product_id, promo_price_usd, display_order)')
        .eq('is_active', true)
        .order('display_order')
        .order('created_at', { ascending: false }),
      getCatalogProducts(),
    ]);
    if (error) throw error;

    const byId = new Map(products.map((product) => [product.id, product]));
    return ((data ?? []) as unknown as PromoRow[]).map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      description: campaign.description ?? '',
      displayOrder: Number(campaign.display_order ?? 0),
      items: (campaign.promo_items ?? [])
        .sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0))
        .map((item) => ({
          id: item.id,
          productId: item.product_id,
          promoPrice: Number(item.promo_price_usd),
          displayOrder: Number(item.display_order ?? 0),
          product: byId.get(item.product_id),
        }))
        .filter((item): item is LivePromoItem => Boolean(item.product)),
    }));
  } catch (error) {
    console.warn('Supabase promotional campaigns unavailable.', error);
    return [];
  }
}

export async function getLivePromoCampaignBySlug(slug: string) {
  const campaigns = await getLivePromoCampaigns();
  return campaigns.find((campaign) => campaign.slug === slug) ?? null;
}

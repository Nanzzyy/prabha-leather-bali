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

export interface LivePromoNavigation {
  enabled: boolean;
  campaign: LivePromoCampaign | null;
}

type PromoRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  display_order?: number | null;
  promo_items?: Array<{ id: string; product_id: string; promo_price_usd: number | string; display_order?: number | null }> | null;
};

function mapCampaign(row: PromoRow, products: Product[]): LivePromoCampaign {
  const byId = new Map(products.map((product) => [product.id, product]));
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? '',
    displayOrder: Number(row.display_order ?? 0),
    items: (row.promo_items ?? [])
      .sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0))
      .map((item) => ({
        id: item.id,
        productId: item.product_id,
        promoPrice: Number(item.promo_price_usd),
        displayOrder: Number(item.display_order ?? 0),
        product: byId.get(item.product_id),
      }))
      .filter((item): item is LivePromoItem => Boolean(item.product)),
  };
}

export async function getLivePromoNavigation(): Promise<LivePromoNavigation> {
  if (!supabase) return { enabled: false, campaign: null };
  try {
    const { data: settings, error: settingsError } = await supabase
      .from('promo_settings')
      .select('is_enabled, nav_campaign_id')
      .eq('id', true)
      .maybeSingle();
    if (settingsError) throw settingsError;
    if (!settings?.is_enabled || !settings.nav_campaign_id) return { enabled: false, campaign: null };

    const [{ data: campaign, error: campaignError }, products] = await Promise.all([
      supabase
        .from('promo_campaigns')
        .select('id, name, slug, description, display_order, promo_items(id, product_id, promo_price_usd, display_order)')
        .eq('id', settings.nav_campaign_id)
        .eq('is_active', true)
        .maybeSingle(),
      getCatalogProducts(),
    ]);
    if (campaignError) throw campaignError;
    if (!campaign) return { enabled: false, campaign: null };
    return { enabled: true, campaign: mapCampaign(campaign as unknown as PromoRow, products) };
  } catch (error) {
    console.warn('Supabase promotional menu unavailable.', error);
    return { enabled: false, campaign: null };
  }
}

export async function getLivePromoCampaignBySlug(slug: string) {
  const navigation = await getLivePromoNavigation();
  return navigation.enabled && navigation.campaign?.slug === slug ? navigation.campaign : null;
}

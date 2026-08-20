import { notFound } from 'next/navigation';
import LocaleLink from '@/components/LocaleLink';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/Icon';
import { getLivePromoCampaignBySlug } from '@/lib/promo/live';
import { getPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const campaign = await getLivePromoCampaignBySlug(slug);
  if (!campaign) return getPageMetadata(lang, 'catalog', `/promo/${slug}/`);
  const metadata = await getPageMetadata(lang, 'catalog', `/promo/${slug}/`);
  return { ...metadata, title: `${campaign.name} — Praba Leather Bali`, description: campaign.description || metadata.description };
}

export default async function PromoDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { slug } = await params;
  const campaign = await getLivePromoCampaignBySlug(slug);
  if (!campaign) notFound();

  return <main className="promo-page promo-page--detail"><header className="promo-hero"><LocaleLink className="promo-back" href="/promo/"><Icon>arrow_back</Icon> All promotions</LocaleLink><span className="eyebrow">Special selection</span><h1>{campaign.name}</h1>{campaign.description && <p>{campaign.description}</p>}</header><section className="promo-detail-grid">{campaign.items.map((item) => <ProductCard key={item.id} product={item.product} priceOverride={item.promoPrice} promoLabel="Promo" />)}</section></main>;
}

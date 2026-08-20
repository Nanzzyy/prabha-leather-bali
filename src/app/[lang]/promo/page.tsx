import LocaleLink from '@/components/LocaleLink';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/Icon';
import { getLivePromoCampaigns } from '@/lib/promo/live';
import { getPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return getPageMetadata(lang, 'catalog', '/promo/');
}

export default async function PromoPage() {
  const campaigns = await getLivePromoCampaigns();
  return <main className="promo-page">
    <header className="promo-hero"><span className="eyebrow">Praba Leather Bali</span><h1>Promotions</h1><p>Considered leather pieces, now at a special price.</p></header>
    {campaigns.length === 0 ? <section className="promo-empty"><Icon>local_offer</Icon><h2>No promotions right now</h2><p>Check back soon for the next Praba seasonal selection.</p><LocaleLink className="button button--outline" href="/catalog/">Explore the collection <Icon>arrow_forward</Icon></LocaleLink></section> : <div className="promo-campaigns">{campaigns.map((campaign) => <section className="promo-campaign" key={campaign.id}><div className="section-heading"><div><span className="eyebrow">Special selection</span><h2>{campaign.name}</h2>{campaign.description && <p>{campaign.description}</p>}</div><LocaleLink className="text-link" href={`/promo/${campaign.slug}/`}>View promotion <Icon>arrow_forward</Icon></LocaleLink></div><div className="promo-grid">{campaign.items.slice(0, 4).map((item) => <ProductCard key={item.id} product={item.product} priceOverride={item.promoPrice} promoLabel="Promo" showOrderAction={false} />)}</div></section>)}</div>}
  </main>;
}

'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useSiteContent } from '@/lib/content/SiteContentContext';
import type { Product } from '@/lib/types/repository';
import { fetchLiveProducts } from '@/lib/catalog/live';
import LocaleLink from './LocaleLink';
import ProductCard from './ProductCard';
import TrustSection from './TrustSection';
import Icon from './Icon';

// Lookbook pulls looks + product hotspots (heavier live read + spot overlay);
// load it client-side only so the homepage first paint isn't blocked by it.
const Lookbook = dynamic(() => import('./Lookbook'), { ssr: false, loading: () => <section className="lookbook lookbook--loading" aria-hidden="true" /> });

export default function HomeEditorialSections({ featured }: { featured: Product[] }) {
  const { content } = useSiteContent();
  const { home } = content;
  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);

  // The homepage is statically generated, so the server prop can be stale after
  // a CMS edit. Refresh the same public catalog used by /catalog/ on mount.
  useEffect(() => {
    fetchLiveProducts(true).then((products) => {
      if (products) setLiveProducts(products);
    }).catch(() => {});
  }, []);

  const liveFeatured = liveProducts?.filter((product) => product.isFeatured) ?? [];
  const displayedFeatured = liveProducts
    ? (liveFeatured.length ? liveFeatured : liveProducts).slice(0, 4)
    : featured;

  return <>
    <section className="home-intro"><span className="eyebrow">{home.introEyebrow}</span><h1>{home.introH1a}<br /><em>{home.introH1b}</em></h1><p>{home.introBody}</p><LocaleLink className="text-link text-link--arrow" href="/catalog/">{home.introCta} <Icon>arrow_forward</Icon></LocaleLink></section>
    <TrustSection />
    <section className="featured-section"><div className="section-heading"><div><span className="eyebrow">{home.featuredEyebrow}</span><h2>{home.featuredTitle}</h2></div><LocaleLink className="text-link" href="/catalog/">{home.featuredCta} <Icon>arrow_forward</Icon></LocaleLink></div><div className="featured-grid">{displayedFeatured.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
    <Lookbook />
    <section className="home-note"><span className="eyebrow">{home.noteEyebrow}</span><h2>{home.noteH2a}<br /><em>{home.noteH2b}</em></h2><p>{home.noteBody}</p><LocaleLink className="button button--dark" href="/catalog/">{home.noteCta} <Icon>arrow_forward</Icon></LocaleLink></section>
  </>;
}

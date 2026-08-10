'use client';

import Image from 'next/image';
import { useSiteContent } from '@/lib/content/SiteContentContext';
import LocaleLink from './LocaleLink';
import Icon from './Icon';
import { getSupabaseImageUrl } from '@/lib/images/supabase-image';

export default function CollectionHero() {
  const { content } = useSiteContent();
  const hero = content.collection.hero;
  return <section className="collection-page__hero">
    <Image className="collection-page__hero-image" src={getSupabaseImageUrl(hero.image.image_url, { width: 1920, quality: 72 })} alt={hero.image.alt} fill priority sizes="100vw" />
    <div className="collection-page__hero-overlay" />
    <div className="collection-page__hero-content">
      <span className="eyebrow">{hero.eyebrow}</span>
      <h1>{hero.h1a} <em>{hero.h1b}</em></h1>
      <p>{hero.body}</p>
      <nav className="collection-page__hero-links" aria-label={hero.collectionLink}>
        <LocaleLink href="/collection/">{hero.collectionLink}</LocaleLink>
        <span aria-hidden="true">•</span>
        {content.collection.items.slice(0, 3).map((item) => <LocaleLink key={item.slug} href={`/collection/${item.slug}/`}>{item.title}</LocaleLink>)}
      </nav>
    </div>
    <span className="collection-page__hero-scroll"><Icon>south</Icon> {hero.scroll}</span>
  </section>;
}

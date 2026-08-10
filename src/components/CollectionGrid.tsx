'use client';

import Image from 'next/image';
import { useSiteContent } from '@/lib/content/SiteContentContext';
import Icon from './Icon';
import LocaleLink from './LocaleLink';
import { getSupabaseImageUrl } from '@/lib/images/supabase-image';

export default function CollectionGrid() {
  const { content } = useSiteContent();
  const { explore, items: collections } = content.collection;
  return <section className="collection-page__explore">
    <div className="section-heading">
      <div><span className="eyebrow">{explore.eyebrow}</span><h2>{explore.title}</h2></div>
      <p>{explore.body}</p>
    </div>
    <div className="collection-page-grid">{collections.map((collection, index) => <LocaleLink key={collection.slug} href={`/collection/${collection.slug}/`} className={`collection-page-card collection-page-card--${index + 1}`}><div className="collection-page-card__image">{collection.image_url && <Image src={getSupabaseImageUrl(collection.image_url, { width: 900, height: 900, quality: 72, resize: 'cover' })} alt={collection.title} fill sizes="(max-width: 760px) 100vw, 50vw" />}</div><div className="collection-page-card__content"><span className="eyebrow">{String(index + 1).padStart(2, '0')} / {content.collection.cardLabel}</span><h2>{collection.title}</h2><p>{collection.copy}</p><span className="text-link">{content.collection.exploreCta} {collection.title} <Icon>arrow_forward</Icon></span></div></LocaleLink>)}</div>
  </section>;
}

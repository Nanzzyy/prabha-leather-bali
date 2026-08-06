'use client';

import Image from 'next/image';
import { useState } from 'react';
import Icon from './Icon';
import LocaleLink from './LocaleLink';
import { useSiteContent } from '@/lib/content/SiteContentContext';
import { collectionSubcategorySlug } from '@/lib/collection/live';
import { normalizeCollectionSubcategory } from '@/lib/content/defaults';

interface Props { onNavigate: () => void; }

export default function CollectionMegaMenu({ onNavigate }: Props) {
  const { content } = useSiteContent();
  const collectionItems = content.collection.items;
  const [activeSlug, setActiveSlug] = useState(collectionItems[0].slug);
  const activeItem = collectionItems.find((item) => item.slug === activeSlug) || collectionItems[0];

  return (
    <div className="collection-mega-menu" onClick={(event) => event.stopPropagation()}>
      <div className="collection-mega-menu__list" aria-label="Product categories">
        {collectionItems.map((item) => {
          return <LocaleLink key={item.slug} href={`/catalog/?category=${item.slug}`} className={activeSlug === item.slug ? 'is-active' : ''} onMouseEnter={() => setActiveSlug(item.slug)} onFocus={() => setActiveSlug(item.slug)} onClick={onNavigate}>
            <span className="collection-mega-menu__thumb">{item.image_url && <Image src={item.image_url} alt="" fill sizes="42px" />}</span>
            <span>{item.title}</span><Icon>chevron_right</Icon>
          </LocaleLink>;
        })}
      </div>
      <div className="collection-mega-menu__detail">
        <div className="collection-mega-menu__feature">{activeItem.image_url && <Image src={activeItem.image_url} alt={activeItem.title} fill sizes="220px" />}<span>{activeItem.title}</span></div>
        <div className="collection-mega-menu__copy"><span className="eyebrow">{activeItem.title}</span><p>{activeItem.copy}</p><div className="collection-mega-menu__subcategories">{activeItem.subcategories.map((entry) => { const subcategory = normalizeCollectionSubcategory(entry); return <LocaleLink key={subcategory.slug} href={`/catalog/?category=${activeItem.slug}&subcategory=${collectionSubcategorySlug(subcategory)}`} onClick={onNavigate}>{subcategory.title}</LocaleLink>; })}</div><LocaleLink className="collection-mega-menu__view-all" href={`/catalog/?category=${activeItem.slug}`} onClick={onNavigate}>{content.collection.megaMenuCta} {activeItem.title} <Icon>arrow_forward</Icon></LocaleLink></div>
      </div>
    </div>
  );
}

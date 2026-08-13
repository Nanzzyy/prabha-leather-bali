'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import LocaleLink from './LocaleLink';
import ProductCard from './ProductCard';
import { useSiteContent } from '@/lib/content/SiteContentContext';
import { fetchLiveCollectionProductGroups, type CollectionProductGroup } from '@/lib/collection/live';
import { buildSubcategoryAssignments, subcategoriesFor } from '@/lib/catalog/subcategories';
import type { Product } from '@/lib/types/repository';
import { getSupabaseImageUrl } from '@/lib/images/supabase-image';

interface Props {
  slug: string;
  initialProducts: Product[];
}

export default function CollectionBrowser({ slug, initialProducts }: Props) {
  const { content } = useSiteContent();
  const collection = content.collection.items.find((item) => item.slug === slug);
  const heroImage = collection?.image_url || content.collection.hero.image.image_url;
  const products = initialProducts;
  const [groups, setGroups] = useState<CollectionProductGroup[] | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchLiveCollectionProductGroups(initialProducts).then((value) => { if (mounted) setGroups(value); }).catch(() => {});
    return () => { mounted = false; };
  }, [initialProducts]);

  const subcategories = useMemo(() => collection ? subcategoriesFor(collection.subcategories) : [], [collection]);
  const assignments = useMemo(
    () => collection ? buildSubcategoryAssignments(collection.slug, products, groups) : new Map<string, Set<string>>(),
    [collection, groups, products],
  );
  const sections = useMemo(() => subcategories.map((subcategory) => ({
    ...subcategory,
    products: products.filter((product) => product.category === slug && assignments.get(product.slug)?.has(subcategory.slug)),
  })), [assignments, products, slug, subcategories]);
  const assignedProducts = useMemo(() => new Set(sections.flatMap((section) => section.products.map((product) => product.slug))), [sections]);
  const unassignedProducts = products.filter((product) => product.category === slug && !assignedProducts.has(product.slug));

  if (!collection) {
    return <main className="collection-browser"><div className="collection-browser-empty"><Icon>search_off</Icon><h1>Collection not found</h1><LocaleLink className="text-link" href="/collection/">Back to collection</LocaleLink></div></main>;
  }

  return (
    <main className="collection-browser">
      <section className="collection-browser__hero">
        <Image src={getSupabaseImageUrl(heroImage, { width: 1920, quality: 72 })} alt={collection.title} fill priority sizes="100vw" />
        <div className="collection-browser__hero-overlay" />
        <div className="collection-browser__hero-copy">
          <nav aria-label="Breadcrumb"><LocaleLink href="/collection/">Collection</LocaleLink><Icon>chevron_right</Icon><span>{collection.title}</span></nav>
          <span className="eyebrow">{collection.title}</span>
          <h1>{collection.title}</h1>
          <p>{collection.copy}</p>
        </div>
      </section>
      <nav className="collection-browser__types" aria-label="Collection categories">
        {content.collection.items.map((item) => <LocaleLink key={item.slug} href={`/collection/${item.slug}/`} className={item.slug === slug ? 'is-active' : ''} ariaCurrent={item.slug === slug ? 'page' : undefined}>{item.title}</LocaleLink>)}
      </nav>
      <section className="collection-browser__content">
        <div className="collection-browser__heading">
          <div><span className="eyebrow">Explore by kind</span><h2>All {collection.title}</h2></div>
          <LocaleLink className="text-link" href={`/catalog/?category=${collection.slug}`}>View full catalog <Icon>arrow_forward</Icon></LocaleLink>
        </div>
        <div className="collection-browser__sections">
          {sections.map((section) => <section className="collection-subcategory-section" key={section.slug}>
            <div className="collection-subcategory-section__head"><div><span className="eyebrow">{collection.title}</span><h2>{section.title}</h2></div><div><span>{section.products.length} {section.products.length === 1 ? 'piece' : 'pieces'}</span><LocaleLink className="text-link text-link--arrow" href={`/catalog/?category=${collection.slug}&subcategory=${section.slug}`} ariaLabel={`View all ${section.title}`}><Icon>north_east</Icon></LocaleLink></div></div>
            {section.products.length ? <div className="collection-browser__grid">{section.products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="collection-browser-empty"><Icon>inventory_2</Icon><p>No pieces are assigned to this subcategory yet.</p></div>}
          </section>)}
          {unassignedProducts.length > 0 && <section className="collection-subcategory-section">
            <div className="collection-subcategory-section__head"><div><span className="eyebrow">{collection.title}</span><h2>More pieces</h2></div><div><span>{unassignedProducts.length} {unassignedProducts.length === 1 ? 'piece' : 'pieces'}</span></div></div>
            <div className="collection-browser__grid">{unassignedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          </section>}
        </div>
      </section>
    </main>
  );
}

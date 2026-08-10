'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { catalogProducts, heroImages } from '@/lib/data/catalog';
import { useCartStore } from '@/lib/store/cartStore';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import { useLang } from '@/lib/i18n/LangContext';
import { flyToPouch } from '@/lib/utils/flyToCart';
import { fetchLiveLooks, type LiveLook } from '@/lib/catalog/live';
import { Product } from '@/lib/types/repository';
import Icon from './Icon';
import LocaleLink from './LocaleLink';
import { useSiteContent } from '@/lib/content/SiteContentContext';

type Spot = { product: Product; x: number; y: number; imageIndex: number };
type Look = { id: string; image: string; images: string[]; title: string; displayOrder: number; spots: Spot[] };

const find = (id: string): Product => catalogProducts.find((p) => p.id === id) ?? catalogProducts[0];

// ponytail: hotspot coordinates are best-guess placeholders — tune to the real photography, and
// swap heroImages for owned lifestyle shoots when available. Used only as a fallback
// until looks are created in the CMS (supabase/cms-content.sql).
const looks: Look[] = [
  { id: 'look-1', image: heroImages[0], images: [heroImages[0], heroImages[1]], title: 'The daily carry', displayOrder: 0, spots: [
    { product: find('ubud-weave-tote'), x: 36, y: 52, imageIndex: 0 },
    { product: find('duke-heritage-boot'), x: 56, y: 86, imageIndex: 0 },
    { product: find('artisan-cardholder'), x: 70, y: 47, imageIndex: 1 },
  ] },
  { id: 'look-2', image: heroImages[3], images: [heroImages[3], heroImages[4]], title: 'The road layer', displayOrder: 1, spots: [
    { product: find('onyx-moto-jacket'), x: 50, y: 42, imageIndex: 0 },
    { product: find('classic-dress-belt'), x: 52, y: 70, imageIndex: 0 },
    { product: find('heritage-briefcase'), x: 28, y: 60, imageIndex: 1 },
  ] },
];

export default function Lookbook() {
  const addItem = useCartStore((state) => state.addItem);
  const { formatPrice } = useCurrency();
  const { t } = useLang();
  const { content } = useSiteContent();
  const [liveLooks, setLiveLooks] = useState<LiveLook[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { fetchLiveLooks().then((l) => { if (l && l.length) setLiveLooks(l); }).catch(() => {}); }, []);
  const looksData = liveLooks ?? looks;

  const cancelClose = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } };
  const openSpot = (key: string) => { cancelClose(); setOpen(key); };
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(() => setOpen(null), 260); };

  const add = (product: Product, source: HTMLElement) => {
    const variant = product.variants[0];
    if (variant) { addItem(product, variant); flyToPouch(source, product.images[0]); }
  };

  return (
    <section className="lookbook" id="collection">
      <div className="section-heading section-heading--center"><span className="eyebrow">{content.home.lookbook.eyebrow}</span><h2>{content.home.lookbook.title}</h2><p>{content.home.lookbook.body}</p></div>
      <div className="lookbook__looks">
        {looksData.map((look, index) => (
          <article className="look" key={look.id} style={{ gridColumn: (look.displayOrder % 2) + 1 }}>
            <div className={`look__media ${look.images.length > 1 ? 'look__media--pair' : ''}`}>
              {look.images.map((image, imageIndex) => (
                <div className="look__panel" key={`${look.id}-${imageIndex}`}>
                  <div className="look__panel-image"><Image src={image} alt={`Praba Leather — ${look.title}, image ${imageIndex + 1}`} fill sizes="(max-width: 760px) 100vw, 50vw" className="look__image" /></div>
                  {imageIndex === 0 && <span className="look__label">Look 0{index + 1} — {look.title}</span>}
                  {look.spots.filter((spot) => (spot.imageIndex ?? 0) === imageIndex).map((spot, i) => {
                    const key = `${look.id}-${imageIndex}-${i}`;
                    const side = spot.x > 66 ? 'right' : spot.x < 34 ? 'left' : 'center';
                    const isOpen = open === key;
                    return (
                      <div
                        className={`look__spot look__spot--${side}`}
                        key={key}
                        style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                        onMouseEnter={() => openSpot(key)}
                        onMouseLeave={() => scheduleClose()}
                        onFocus={() => openSpot(key)}
                        onBlur={() => scheduleClose()}
                      >
                        <button type="button" className={`look__dot ${isOpen ? 'is-active' : ''}`} aria-label={spot.product.name} aria-expanded={isOpen} onClick={() => setOpen(key)}>
                          <span />
                        </button>
                        {isOpen && (
                          <div className="look__card" role="dialog" aria-label={spot.product.name}>
                            <button type="button" className="look__card-close" onClick={() => setOpen(null)} aria-label={`Close ${spot.product.name}`}><Icon>close</Icon></button>
                            <div className="look__card-img">
                              {spot.product.images[0]
                                ? <Image src={spot.product.images[0]} alt={spot.product.name} fill sizes="120px" />
                                : <span aria-hidden>{spot.product.name.charAt(0)}</span>}
                            </div>
                            <div className="look__card-body">
                              <span className="eyebrow">{spot.product.category}</span>
                              <LocaleLink href={`/catalog/${spot.product.slug}/`} className="look__card-name">{spot.product.name}</LocaleLink>
                              <span className="look__card-price">{formatPrice(spot.product.basePrice)}</span>
                              <button type="button" className="look__card-add" onClick={(e) => add(spot.product, e.currentTarget)}><Icon>shopping_bag</Icon> {t('cta.addToPouch')}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

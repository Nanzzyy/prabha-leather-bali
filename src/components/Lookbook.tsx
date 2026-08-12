'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import { useLang } from '@/lib/i18n/LangContext';
import { flyToPouch } from '@/lib/utils/flyToCart';
import { fetchLiveLooks, type LiveLook } from '@/lib/catalog/live';
import { getSupabaseImageUrl } from '@/lib/images/supabase-image';
import type { Product } from '@/lib/types/repository';
import Icon from './Icon';
import LocaleLink from './LocaleLink';
import { useSiteContent } from '@/lib/content/SiteContentContext';

export default function Lookbook({ initialLooks }: { initialLooks?: LiveLook[] | null }) {
  const addItem = useCartStore((state) => state.addItem);
  const { formatPrice } = useCurrency();
  const { t } = useLang();
  const { content } = useSiteContent();
  const [liveLooks, setLiveLooks] = useState<LiveLook[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { fetchLiveLooks().then((l) => { if (l && l.length) setLiveLooks(l); }).catch(() => {}); }, []);
  const looksData = liveLooks ?? initialLooks ?? [];

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('.look__card')) return;
      setOpen(null);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

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
              {look.images.map((image, imageIndex) => {
                const panelSpots = look.spots.filter((spot) => (spot.imageIndex ?? 0) === imageIndex);
                const panelOpen = panelSpots.some((_, spotIndex) => open === `${look.id}-${imageIndex}-${spotIndex}`);
                return <div className={`look__panel ${panelOpen ? 'look__panel--active' : ''}`} key={`${look.id}-${imageIndex}`}>
                  <div className="look__panel-image"><Image src={getSupabaseImageUrl(image, { width: 1400, quality: 72 })} alt={`Praba Leather — ${look.title}, image ${imageIndex + 1}`} fill sizes="(max-width: 760px) 100vw, 50vw" className="look__image" /></div>
                  {imageIndex === 0 && <span className="look__label">Look 0{index + 1} — {look.title}</span>}
                  {panelSpots.map((spot, i) => {
                    const key = `${look.id}-${imageIndex}-${i}`;
                    const side = spot.x > 66 ? 'right' : spot.x < 34 ? 'left' : 'center';
                    const isOpen = open === key;
                    return (
                      <div
                        className={`look__spot look__spot--${side} ${isOpen ? 'look__spot--open' : ''}`}
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
                                ? <Image src={getSupabaseImageUrl(spot.product.images[0], { width: 256, height: 256, quality: 70, resize: 'cover' })} alt={spot.product.name} fill sizes="120px" />
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
                </div>;
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

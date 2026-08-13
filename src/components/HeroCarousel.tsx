'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { LiveHero } from '@/lib/catalog/live';
import { fallbackHeroImage } from '@/lib/data/catalog';
import { getSupabaseImageUrl } from '@/lib/images/supabase-image';
import Icon from './Icon';

export default function HeroCarousel({ initialSlides }: { initialSlides?: LiveHero[] | null }) {
  const [active, setActive] = useState(0);
  const slides: LiveHero[] = initialSlides?.length ? initialSlides : [{ image_url: fallbackHeroImage, alt_text: 'Editorial view of handcrafted leather', caption: '' }];

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const [loadAdjacent, setLoadAdjacent] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoadAdjacent(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="hero-carousel" aria-label="Praba Leather editorial collection">
      {slides.map((image, index) => (
        (index === active || (loadAdjacent && index === (active + 1) % slides.length)) && <Image key={image.image_url} src={getSupabaseImageUrl(image.image_url, { width: 1920, quality: 72 })} alt={image.alt_text} fill preload={index === 0} sizes="100vw" className={`hero-carousel__image ${index === active ? 'hero-carousel__image--active' : ''}`} />
      ))}
      <div className="hero-carousel__veil" />
      <div className="hero-carousel__caption"><span>{String(active + 1).padStart(2, '0')} - {String(slides.length).padStart(2, '0')}</span><span>{slides[active]?.caption || 'Full-grain leather / Bali, Indonesia'}</span></div>
      <div className="hero-carousel__controls" aria-label="Hero slides">
        <button type="button" onClick={() => setActive((active - 1 + slides.length) % slides.length)} aria-label="Previous slide"><Icon>arrow_back</Icon></button>
        {slides.map((image, index) => <button key={image.image_url} type="button" onClick={() => setActive(index)} className={index === active ? 'is-active' : ''} aria-label={`Go to slide ${index + 1}`} />)}
        <button type="button" onClick={() => setActive((active + 1) % slides.length)} aria-label="Next slide"><Icon>arrow_forward</Icon></button>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { heroImages } from '@/lib/data/catalog';
import { fetchLiveHeroes, type LiveHero } from '@/lib/catalog/live';
import Icon from './Icon';

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [slides, setSlides] = useState<LiveHero[]>(heroImages.map((image) => ({ image_url: image, alt_text: 'Editorial view of handcrafted leather', caption: '' })));

  // Live-read managed hero images; fall back to the hardcoded set on any failure.
  useEffect(() => { fetchLiveHeroes().then((h) => { if (h && h.length) setSlides(h); }).catch(() => {}); }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="hero-carousel" aria-label="Praba Leather editorial collection">
      {slides.map((image, index) => (
        <Image key={image.image_url} src={image.image_url} alt={image.alt_text} fill priority={index === 0} sizes="100vw" className={`hero-carousel__image ${index === active ? 'hero-carousel__image--active' : ''}`} />
      ))}
      <div className="hero-carousel__veil" />
      <div className="hero-carousel__caption"><span>0{active + 1} — {String(slides.length).padStart(2, '0')}</span><span>{slides[active]?.caption || 'Full-grain leather / Bali, Indonesia'}</span></div>
      <div className="hero-carousel__controls" aria-label="Hero slides">
        <button type="button" onClick={() => setActive((active - 1 + slides.length) % slides.length)} aria-label="Previous slide"><Icon>arrow_back</Icon></button>
        {slides.map((image, index) => <button key={image.image_url} type="button" onClick={() => setActive(index)} className={index === active ? 'is-active' : ''} aria-label={`Go to slide ${index + 1}`} />)}
        <button type="button" onClick={() => setActive((active + 1) % slides.length)} aria-label="Next slide"><Icon>arrow_forward</Icon></button>
      </div>
    </section>
  );
}

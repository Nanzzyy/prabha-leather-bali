'use client';

import Image from 'next/image';
import Icon from '@/components/Icon';
import Carousel from '@/components/Carousel';
import { useSiteContent } from '@/lib/content/SiteContentContext';
import { getSupabaseImageUrl } from '@/lib/images/supabase-image';

type PhotoProps = { src?: string; alt: string; label?: string; icon?: string; className?: string };

function Photo({ src, alt, label = '', icon = 'image', className = '' }: PhotoProps) {
  if (src) return <figure className={`about-photo ${className}`}><Image src={getSupabaseImageUrl(src, { width: 1200, quality: 74 })} alt={alt} fill sizes="(max-width: 900px) 100vw, 50vw" className="about-photo__img" /></figure>;
  return <figure className={`about-photo about-photo--placeholder ${className}`} aria-label={alt}><span className="material-symbols-outlined" aria-hidden>{icon}</span><span className="about-photo__label">{label}</span></figure>;
}

export default function AboutClient() {
  const { content } = useSiteContent();
  const about = content.about;
  return <main className="about-page">
    <section className="about-hero"><span className="eyebrow">{about.hero.eyebrow}</span><h1>{about.hero.title}</h1></section>

    <section className="about-features">{about.features.map((feature) => <article key={feature.title} className="about-feature"><span className="about-feature__icon"><Icon>{feature.icon}</Icon></span><h3>{feature.title}</h3><p>{feature.body}</p></article>)}</section>

    <section className="about-split"><Photo className="about-split__media" src={about.beginning.image.image_url} alt={about.beginning.image.alt} label="The craft" icon="handyman" /><div className="about-split__text"><span className="eyebrow">{about.beginning.eyebrow}</span><h2>{about.beginning.title}</h2><p>{about.beginning.body1}</p><p>{about.beginning.body2}</p></div></section>

    <section className="about-split"><div className="about-split__text"><span className="eyebrow">{about.belief.eyebrow}</span><h2>{about.belief.title}</h2><p>{about.belief.body1}</p><p>{about.belief.body2}</p></div><Photo className="about-split__media" src={about.belief.image.image_url} alt={about.belief.image.alt} label="The wearers" icon="groups" /></section>

    <section className="about-testimonial"><h2>{about.testimonial.title}</h2><p className="about-testimonial__intro">{about.testimonial.intro}</p><Carousel itemLabel="reviews" className="about-testimonial__carousel">{about.testimonials.map((testimonial) => <article key={`${testimonial.name}-${testimonial.role}`} className="carousel__item review-card" data-carousel-item><Photo className="review-card__photo" src={testimonial.src} alt={`${testimonial.name}, Praba client`} label="Client" icon="account_circle" /><div className="review-card__body"><div className="about-stars" aria-label="5 out of 5 stars">{Array.from({ length: 5 }).map((_, index) => <span key={index} aria-hidden>★</span>)}</div><blockquote className="review-card__quote">{testimonial.quote}</blockquote><div className="review-card__author"><span className="review-card__name">{testimonial.name}</span><span className="review-card__role">{testimonial.role}</span></div></div></article>)}</Carousel></section>

    <section className="about-shopgram"><h2>{about.shopgram.title}</h2><p className="about-shopgram__sub">{about.shopgram.intro}</p><div className="about-shopgram__grid"><Carousel itemLabel="looks" className="about-carousel">{about.shopgram.items.map((item, index) => <div key={`${item.alt}-${index}`} className="carousel__item carousel__item--gram" data-carousel-item><Photo src={item.image_url} alt={item.alt} label={item.label} icon={item.icon} /></div>)}</Carousel></div></section>
  </main>;
}

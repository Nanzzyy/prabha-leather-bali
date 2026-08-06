'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import Icon from './Icon';

interface Props {
  children: ReactNode;
  itemLabel?: string;
  className?: string;
}

export default function Carousel({ children, itemLabel = 'items', className = '' }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const stepSize = () => {
    const el = trackRef.current;
    if (!el) return 300;
    const item = el.querySelector<HTMLElement>('[data-carousel-item]');
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 16;
    return item ? item.offsetWidth + gap : el.clientWidth * 0.8;
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * stepSize(), behavior: 'smooth' });
  };

  return (
    <div className={`carousel ${className}`}>
      <button type="button" className="carousel__btn carousel__btn--prev" onClick={() => scrollBy(-1)} disabled={!canPrev} aria-label={`Previous ${itemLabel}`}><Icon>chevron_left</Icon></button>
      <div className="carousel__track" ref={trackRef}>{children}</div>
      <button type="button" className="carousel__btn carousel__btn--next" onClick={() => scrollBy(1)} disabled={!canNext} aria-label={`Next ${itemLabel}`}><Icon>chevron_right</Icon></button>
    </div>
  );
}
